import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function validateApiKey(supabase: SupabaseClient, authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { data: null, error: 'Missing or invalid Authorization header' }
    }

    const rawKey = authHeader.replace('Bearer ', '')

    // Compute hash (must match the logic in generate_api_key)
    // Since we can't easily do sha256 in SQL via pure text without pgcrypto, 
    // we assume the DB uses the same hashing algorithm.

    // We'll call the RPC we created
    const { data, error } = await supabase.rpc('validate_api_key', {
        p_key_hash: await hashKey(rawKey)
    })

    if (error || !data || !data.is_valid) {
        return { data: null, error: 'Invalid API Key' }
    }

    return { data, error: null }
}

async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
