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

        const { export_id } = await req.json()

        if (!export_id) {
            throw new Error('Missing export_id')
        }

        // 1. Get export details
        const { data: exportData, error: exportError } = await supabaseClient
            .from('dataset_exports')
            .select('*')
            .eq('id', export_id)
            .single()

        if (exportError || !exportData) {
            throw new Error('Export record not found')
        }

        // 2. Update status to processing
        await supabaseClient
            .from('dataset_exports')
            .update({ status: 'processing', updated_at: new Date().toISOString() })
            .eq('id', export_id)

        // 3. Fetch submissions via RPC
        const { data: submissions, error: submissionsError } = await supabaseClient.rpc(
            'get_export_data',
            { p_project_id: exportData.project_id }
        )

        if (submissionsError) {
            throw submissionsError
        }

        // 4. Transform data based on format
        let content = ''
        let contentType = ''
        let fileName = `${export_id}.${exportData.format}`

        if (exportData.format === 'json') {
            content = JSON.stringify(submissions, null, 2)
            contentType = 'application/json'
        } else if (exportData.format === 'csv') {
            // Very basic CSV conversion
            if (submissions.length > 0) {
                const headers = Object.keys(submissions[0]).join(',')
                const rows = submissions.map(row =>
                    Object.values(row).map(val =>
                        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
                    ).join(',')
                ).join('\n')
                content = `${headers}\n${rows}`
            }
            contentType = 'text/csv'
        } else {
            throw new Error(`Unsupported format: ${exportData.format}`)
        }

        // 5. Upload to Storage
        const filePath = `${exportData.company_id}/${fileName}`
        const { error: uploadError } = await supabaseClient.storage
            .from('datasets')
            .upload(filePath, content, {
                contentType,
                upsert: true
            })

        if (uploadError) {
            throw uploadError
        }

        // 6. Get signed URL (valid for 7 days)
        const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
            .from('datasets')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7)

        if (signedUrlError) {
            throw signedUrlError
        }

        // 7. Update export record
        const { error: finalUpdateError } = await supabaseClient
            .from('dataset_exports')
            .update({
                status: 'ready',
                file_path: filePath,
                record_count: submissions.length,
                file_size_bytes: content.length,
                signed_url: signedUrlData.signedUrl,
                signed_url_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
                completed_at: new Date().toISOString()
            })
            .eq('id', export_id)

        if (finalUpdateError) {
            throw finalUpdateError
        }

        // 8. Update queue status
        await supabaseClient
            .from('export_queue')
            .update({ completed_at: new Date().toISOString() })
            .eq('export_id', export_id)

        return new Response(
            JSON.stringify({ success: true, message: 'Dataset packaged successfully', url: signedUrlData.signedUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
