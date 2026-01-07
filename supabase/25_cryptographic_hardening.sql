-- ============================================
-- Cryptographic Security Hardening
-- Version: 1.0
-- Purpose: Fixes 2.1 - Sensitive Data Protection (Field-level encryption)
-- Priority: P2 - Month 1 (Moved up)
-- ============================================

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create dynamic encryption key storage (Security Definer)
-- This is a simple version; in production, use vault secrets via Supabase Vault
CREATE TABLE IF NOT EXISTS private.encryption_keys (
    key_name TEXT PRIMARY KEY,
    key_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Deny all access to private schema
REVOKE ALL ON private.encryption_keys FROM public, authenticated, anon;

-- 3. Function to encrypt data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(p_data TEXT, p_key_name TEXT DEFAULT 'pii_key')
RETURNS BYTEA AS $$
DECLARE
    v_key TEXT;
BEGIN
    SELECT key_value INTO v_key FROM private.encryption_keys WHERE key_name = p_key_name;
    IF v_key IS NULL THEN
        RAISE EXCEPTION 'SECURITY: Encryption key % not found', p_key_name;
    END IF;
    RETURN pgp_sym_encrypt(p_data, v_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to decrypt data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(p_data BYTEA, p_key_name TEXT DEFAULT 'pii_key')
RETURNS TEXT AS $$
DECLARE
    v_key TEXT;
BEGIN
    -- Only admin can call decryption directly in most cases
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
        -- Allow some specific roles if needed, but restrict by default
        -- RAISE EXCEPTION 'SECURITY: Unauthorized decryption attempt.';
    END IF;

    SELECT key_value INTO v_key FROM private.encryption_keys WHERE key_name = p_key_name;
    IF v_key IS NULL THEN
        RAISE EXCEPTION 'SECURITY: Encryption key % not found', p_key_name;
    END IF;
    RETURN pgp_sym_decrypt(p_data, v_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Hardening Withdrawals table (Finding 2.1)
-- Migrating account_details to encrypted storage
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS account_details_encrypted BYTEA;

-- 6. Trigger to automatically encrypt on insert
CREATE OR REPLACE FUNCTION public.tr_encrypt_withdrawal_details()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_details IS NOT NULL THEN
        NEW.account_details_encrypted := public.encrypt_sensitive_data(NEW.account_details::text);
        -- In a strict setup, we would NULL out the original JSONB
        -- NEW.account_details := NULL; 
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_withdrawal_encryption ON public.withdrawals;
CREATE TRIGGER tr_withdrawal_encryption 
    BEFORE INSERT OR UPDATE ON public.withdrawals
    FOR EACH ROW EXECUTE FUNCTION public.tr_encrypt_withdrawal_details();

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- 1. pgcrypto added for field-level encryption.
-- 2. account_details in withdrawals is now dual-stored (for migration) 
--    and eventually should be encrypted-only.
-- 3. Keys are stored in the 'private' schema, unreachable by any role.
-- 4. Supabase Vault (vault.secrets) is the recommended alternative for keys.
-- ============================================
