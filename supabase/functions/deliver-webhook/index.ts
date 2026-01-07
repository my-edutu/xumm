import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { event_id } = await req.json()

        if (!event_id) {
            throw new Error('Missing event_id')
        }

        // 1. Fetch event and webhook config
        const { data: event, error: eventError } = await supabaseClient
            .from('webhook_events')
            .select('*, company_webhooks(*)')
            .eq('id', event_id)
            .single()

        if (eventError || !event) {
            throw new Error('Webhook event not found')
        }

        const webhook = event.company_webhooks
        if (!webhook || !webhook.is_active) {
            await supabaseClient
                .from('webhook_events')
                .update({ status: 'failed', response_body: 'Webhook config missing or inactive' })
                .eq('id', event_id)
            return new Response('Webhook inactive', { status: 400 })
        }

        // 2. Prepare payload
        const payload = JSON.stringify({
            event: event.event_type,
            timestamp: event.created_at,
            data: event.payload
        })

        // 3. Send request
        const startTime = Date.now()
        let responseStatus: number | null = null
        let responseBody = ''
        let success = false

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

            const res = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XUM-Signature': 'sha256=stub_signature', // In prod, compute HMAC using webhook.secret_hash
                    'X-XUM-Event': event.event_type
                },
                body: payload,
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            responseStatus = res.status
            responseBody = await res.text()
            success = res.ok
        } catch (fetchError) {
            responseBody = fetchError.message
        }

        const duration = Date.now() - startTime

        // 4. Update event status
        const attempts = event.attempts + 1
        let status = success ? 'sent' : (attempts >= event.max_attempts ? 'failed' : 'retrying')

        // Exponential backoff for retries
        let nextRetryAt = null
        if (status === 'retrying') {
            const backoffSeconds = Math.pow(2, attempts) * 60 // 2 min, 4 min, 8 min...
            nextRetryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString()
        }

        await supabaseClient
            .from('webhook_events')
            .update({
                status,
                attempts,
                response_status: responseStatus,
                response_body: responseBody.substring(0, 1000), // Limit storage
                sent_at: success ? new Date().toISOString() : null,
                next_retry_at: nextRetryAt
            })
            .eq('id', event_id)

        // 5. Update webhook failure count if failed
        if (!success) {
            await supabaseClient.rpc('increment_webhook_failures', { p_webhook_id: webhook.id })
        } else {
            await supabaseClient
                .from('company_webhooks')
                .update({ last_triggered_at: new Date().toISOString(), failure_count: 0 })
                .eq('id', webhook.id)
        }

        return new Response(JSON.stringify({ success, status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: success ? 200 : 500
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})
