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

        const body = await req.json()
        const provider = req.headers.has('stripe-signature') ? 'stripe' :
            req.headers.has('x-paystack-signature') ? 'paystack' : 'manual'

        // 1. Extract Provider Event ID for Idempotency
        let providerEventId = ''
        if (provider === 'stripe') providerEventId = body.id
        else if (provider === 'paystack') providerEventId = body.data?.id?.toString() || body.event
        else providerEventId = body.reference || `manual-${Date.now()}`

        // 2. Check for duplicate event
        const { data: existingEvent } = await supabaseClient
            .from('payment_events')
            .select('status')
            .eq('provider', provider)
            .eq('provider_event_id', providerEventId)
            .single()

        if (existingEvent?.status === 'processed') {
            return new Response(JSON.stringify({ success: true, message: 'Event already processed' }), { status: 200 })
        }

        // 3. Log event receipt
        if (!existingEvent) {
            await supabaseClient.from('payment_events').insert({
                provider,
                provider_event_id: providerEventId,
                event_type: body.type || body.event || 'manual_deposit',
                raw_payload: body,
                status: 'received'
            })
        }

        let companyId = body.data?.object?.metadata?.company_id || body.data?.metadata?.company_id || body.company_id
        let amount = 0
        let type = ''
        let reference = providerEventId

        // 4. Parse Provider Data
        if (provider === 'stripe') {
            if (body.type === 'checkout.session.completed') {
                amount = body.data.object.amount_total / 100
                type = 'deposit'
            }
        } else if (provider === 'paystack') {
            if (body.event === 'charge.success') {
                amount = body.data.amount / 100
                type = 'deposit'
            }
        } else if (body.type === 'internal_deposit') {
            amount = body.amount
            type = 'deposit'
        }

        if (!companyId || amount <= 0) {
            return new Response(JSON.stringify({ error: 'Invalid payment data or missing company_id' }), { status: 400 })
        }

        // 5. Execute Atomic Deposit via RPC
        const { data: rpcResult, error: rpcError } = await supabaseClient.rpc('handle_company_deposit', {
            p_company_id: companyId,
            p_amount: amount,
            p_reference: reference,
            p_provider: provider
        })

        if (rpcError) throw rpcError

        // 6. Mark event as processed
        await supabaseClient
            .from('payment_events')
            .update({
                status: 'processed',
                processed_at: new Date().toISOString()
            })
            .eq('provider', provider)
            .eq('provider_event_id', providerEventId)

        return new Response(JSON.stringify({
            success: true,
            message: 'Deposit processed',
            new_balance: rpcResult.new_balance
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error) {
        console.error('Payment Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})

