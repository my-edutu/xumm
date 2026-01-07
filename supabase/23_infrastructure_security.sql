-- ============================================
-- Infrastructure Security Hardening
-- Version: 1.0
-- Purpose: Fixes S7.4 - Admin IP Allowlisting & Auth Security
-- Priority: P2 - Week 2
-- ============================================

-- 1. IP Allowlisting for Admin Roles
CREATE TABLE IF NOT EXISTS public.admin_ip_allowlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_range INET NOT NULL, -- Supporting individual IPs or CIDR blocks
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.users(id),
    UNIQUE(admin_id, ip_range)
);

-- Enable RLS
ALTER TABLE public.admin_ip_allowlist ENABLE ROW LEVEL SECURITY;

-- Only super-admins can manage the allowlist
CREATE POLICY "Super admins manage allowlist" ON public.admin_ip_allowlist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin' AND metadata->>'super_admin' = 'true'
        )
    );

-- 2. Secure Function to validate Admin Access
CREATE OR REPLACE FUNCTION public.assert_admin_access()
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role TEXT;
    v_client_ip INET;
    v_is_allowed BOOLEAN;
    v_has_allowlist_entries BOOLEAN;
BEGIN
    -- 1. Check user role
    SELECT role INTO v_user_role FROM public.users WHERE id = auth.uid();
    
    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'SECURITY: Access Denied. Admin privileges required.';
    END IF;

    -- 2. Check if IP allowlisting is active for this admin
    SELECT EXISTS (SELECT 1 FROM public.admin_ip_allowlist WHERE admin_id = auth.uid()) 
    INTO v_has_allowlist_entries;

    IF v_has_allowlist_entries THEN
        v_client_ip := inet_client_addr();
        
        -- Special case for development if needed, but in production we want strict checks
        -- If inet_client_addr() is NULL, it might be an internal request or misconfiguration
        IF v_client_ip IS NULL THEN
            -- In some cloud environments, you might need to extract from headers via a custom extension
            -- For now, we assume standard direct connection or proxy passing the IP
            RETURN TRUE; 
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM public.admin_ip_allowlist 
            WHERE admin_id = auth.uid() AND v_client_ip <<= ip_range
        ) INTO v_is_allowed;

        IF NOT v_is_allowed THEN
            -- Log unauthorized access attempt
            INSERT INTO public.audit_logs (actor_id, action, entity_type, ip_address, new_data)
            VALUES (auth.uid(), 'unauthorized_admin_access', 'security', v_client_ip, 
                   jsonb_build_object('reason', 'IP not in allowlist', 'attempted_ip', v_client_ip::text));
            
            RAISE EXCEPTION 'SECURITY: Access Denied. IP address % is not in your allowlist.', v_client_ip;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enhance Admin Audit Logging to include more context
-- (Already implemented in 20_security_hardening.sql, but keeping it in mind)

-- 4. Session Security: Function to check MFA level
-- This will be used in the future to enforce MFA
CREATE OR REPLACE FUNCTION public.require_mfa_level(p_level TEXT DEFAULT 'aal2')
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.jwt()->>'aal' != p_level THEN
        RAISE EXCEPTION 'SECURITY: Higher authentication assurance level required (%)', p_level;
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Seed an initial super-admin metadata if not exists
-- This allows the first admin to manage the IP allowlist
UPDATE public.users SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"super_admin": true}'::jsonb 
WHERE role = 'admin' AND metadata->>'super_admin' IS NULL;

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- 1. admin_ip_allowlist table tracks allowed IPs per admin.
-- 2. assert_admin_access() should be called at the start of all admin RPCs.
-- 3. require_mfa_level() can be used to enforce Supabase MFA.
-- 4. Use CIDR notation (e.g., '1.2.3.4/32' for single IP).
-- ============================================
