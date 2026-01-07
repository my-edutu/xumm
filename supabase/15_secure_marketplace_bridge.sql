-- XUM Secure Marketplace Bridge
-- Migration: 14_secure_marketplace_bridge.sql
-- Security-first design for Admin-controlled data asset management

-- ============================================
-- 1. ENHANCED DATA ASSETS TABLE (Admin-Controlled)
-- ============================================

CREATE TABLE IF NOT EXISTS public.data_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Asset Info
    asset_name TEXT NOT NULL,
    asset_slug TEXT UNIQUE NOT NULL, -- URL-safe identifier
    description TEXT,
    
    -- Data Classification
    data_type TEXT CHECK (data_type IN ('text', 'voice', 'image', 'video', 'mixed')) NOT NULL,
    target_languages TEXT[] DEFAULT '{}',
    sample_count INTEGER DEFAULT 0,
    
    -- Pricing & Licensing
    base_price_usd DECIMAL(12,2) NOT NULL,
    license_type TEXT CHECK (license_type IN ('exclusive', 'non_exclusive', 'research_only')) DEFAULT 'non_exclusive',
    
    -- Source Tracking
    source_project_id UUID REFERENCES public.linguasence_projects(id),
    source_batch_ids UUID[] DEFAULT '{}', -- References to dataset_batches
    
    -- Quality Metrics (computed)
    avg_consensus_score DECIMAL(4,3),
    quality_tier TEXT CHECK (quality_tier IN ('premium', 'standard', 'basic')) DEFAULT 'standard',
    
    -- Asset Files (Hetzner S3)
    manifest_url TEXT, -- Encrypted URL to dataset manifest
    sample_preview_url TEXT, -- Public preview sample
    
    -- Admin Control
    visibility TEXT CHECK (visibility IN ('draft', 'internal', 'published', 'archived')) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    
    -- Security & Compliance
    requires_nda BOOLEAN DEFAULT false,
    requires_kyc BOOLEAN DEFAULT false,
    data_retention_days INTEGER DEFAULT 365,
    
    -- Audit Fields
    created_by UUID REFERENCES public.users(id) NOT NULL,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. COMPANY PURCHASE AUTHORIZATION
-- ============================================

-- Companies must be pre-approved to purchase certain assets
CREATE TABLE IF NOT EXISTS public.company_asset_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) NOT NULL,
    
    -- Authorization Details
    authorized_by UUID REFERENCES public.users(id) NOT NULL, -- Admin who approved
    authorization_type TEXT CHECK (authorization_type IN ('view', 'purchase', 'exclusive')) DEFAULT 'view',
    
    -- Pricing Override (admin can offer special pricing)
    custom_price_usd DECIMAL(12,2),
    discount_pct DECIMAL(5,2) DEFAULT 0,
    
    -- Time Constraints
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT CHECK (status IN ('active', 'revoked', 'expired')) DEFAULT 'active',
    revocation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(company_id, asset_id)
);

-- ============================================
-- 3. SECURE PURCHASE TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.asset_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Identity
    transaction_ref TEXT UNIQUE NOT NULL, -- XUM-TX-{timestamp}-{random}
    
    -- Parties
    company_id UUID REFERENCES public.users(id) NOT NULL,
    asset_id UUID REFERENCES public.data_assets(id) NOT NULL,
    authorization_id UUID REFERENCES public.company_asset_authorizations(id),
    
    -- Financial
    purchase_price_usd DECIMAL(12,2) NOT NULL,
    platform_fee_usd DECIMAL(12,2) NOT NULL, -- 20% default
    worker_pool_usd DECIMAL(12,2) NOT NULL,
    
    -- Payment
    payment_method TEXT CHECK (payment_method IN ('invoice', 'stripe', 'wire', 'crypto')),
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    payment_reference TEXT,
    
    -- Delivery
    delivery_status TEXT CHECK (delivery_status IN ('pending', 'generating', 'delivered', 'failed')) DEFAULT 'pending',
    access_token TEXT UNIQUE, -- Secure download token
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    download_url TEXT, -- Presigned S3 URL (encrypted)
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    
    -- Timestamps
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE -- Access expiration
);

-- ============================================
-- 4. IMMUTABLE AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.marketplace_audit_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Event Details
    event_type TEXT NOT NULL, -- 'asset_created', 'asset_published', 'authorization_granted', 'purchase', etc.
    event_severity TEXT CHECK (event_severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    
    -- Actor
    actor_id UUID REFERENCES public.users(id),
    actor_role TEXT,
    actor_ip TEXT, -- Captured via Edge Function
    
    -- Target
    target_type TEXT, -- 'data_asset', 'authorization', 'purchase'
    target_id UUID,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    user_agent TEXT,
    session_id TEXT,
    
    -- Immutable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Prevent any modifications to audit log
CREATE OR REPLACE RULE prevent_audit_update AS 
    ON UPDATE TO public.marketplace_audit_log DO INSTEAD NOTHING;
    
CREATE OR REPLACE RULE prevent_audit_delete AS 
    ON DELETE TO public.marketplace_audit_log DO INSTEAD NOTHING;

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_asset_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_audit_log ENABLE ROW LEVEL SECURITY;

-- DATA ASSETS: Admins have full control
CREATE POLICY "Admins can manage all assets" ON public.data_assets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- DATA ASSETS: Companies can only view published assets they're authorized for
CREATE POLICY "Companies view published or authorized assets" ON public.data_assets
    FOR SELECT USING (
        visibility = 'published' 
        OR EXISTS (
            SELECT 1 FROM public.company_asset_authorizations 
            WHERE asset_id = data_assets.id 
            AND company_id = auth.uid() 
            AND status = 'active'
            AND (valid_until IS NULL OR valid_until > now())
        )
    );

-- AUTHORIZATIONS: Admin full access
CREATE POLICY "Admins manage authorizations" ON public.company_asset_authorizations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- AUTHORIZATIONS: Companies view their own
CREATE POLICY "Companies view own authorizations" ON public.company_asset_authorizations
    FOR SELECT USING (company_id = auth.uid());

-- PURCHASES: Admin full access
CREATE POLICY "Admins view all purchases" ON public.asset_purchases
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- PURCHASES: Companies view their own
CREATE POLICY "Companies view own purchases" ON public.asset_purchases
    FOR SELECT USING (company_id = auth.uid());

-- PURCHASES: Companies can insert (through secure function only)
CREATE POLICY "Companies can purchase via function" ON public.asset_purchases
    FOR INSERT WITH CHECK (company_id = auth.uid());

-- AUDIT LOG: Admin read-only
CREATE POLICY "Admins can read audit log" ON public.marketplace_audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 6. SECURE FUNCTIONS (Admin-Only Operations)
-- ============================================

-- Verify caller is admin
CREATE OR REPLACE FUNCTION verify_admin_caller()
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create and publish a data asset (Admin only)
CREATE OR REPLACE FUNCTION admin_create_data_asset(
    p_name TEXT,
    p_description TEXT,
    p_data_type TEXT,
    p_languages TEXT[],
    p_price DECIMAL,
    p_license_type TEXT,
    p_project_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_asset_id UUID;
    v_slug TEXT;
BEGIN
    -- Security check
    PERFORM verify_admin_caller();
    
    -- Generate URL-safe slug
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8);
    
    INSERT INTO public.data_assets (
        asset_name, asset_slug, description, data_type, 
        target_languages, base_price_usd, license_type,
        source_project_id, created_by, visibility
    ) VALUES (
        p_name, v_slug, p_description, p_data_type,
        p_languages, p_price, p_license_type,
        p_project_id, auth.uid(), 'draft'
    )
    RETURNING id INTO v_asset_id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, actor_id, actor_role, target_type, target_id, new_values)
    VALUES ('asset_created', auth.uid(), 'admin', 'data_asset', v_asset_id, 
            jsonb_build_object('name', p_name, 'price', p_price));
    
    RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Publish/unpublish asset (Admin only)
CREATE OR REPLACE FUNCTION admin_set_asset_visibility(
    p_asset_id UUID,
    p_visibility TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_visibility TEXT;
BEGIN
    PERFORM verify_admin_caller();
    
    SELECT visibility INTO v_old_visibility FROM public.data_assets WHERE id = p_asset_id;
    
    UPDATE public.data_assets 
    SET visibility = p_visibility,
        updated_at = now(),
        approved_by = CASE WHEN p_visibility = 'published' THEN auth.uid() ELSE approved_by END,
        approved_at = CASE WHEN p_visibility = 'published' THEN now() ELSE approved_at END
    WHERE id = p_asset_id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, event_severity, actor_id, actor_role, target_type, target_id, old_values, new_values)
    VALUES (
        CASE WHEN p_visibility = 'published' THEN 'asset_published' ELSE 'asset_visibility_changed' END,
        CASE WHEN p_visibility = 'published' THEN 'info' ELSE 'warning' END,
        auth.uid(), 'admin', 'data_asset', p_asset_id,
        jsonb_build_object('visibility', v_old_visibility),
        jsonb_build_object('visibility', p_visibility)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant company authorization (Admin only)
CREATE OR REPLACE FUNCTION admin_authorize_company(
    p_company_id UUID,
    p_asset_id UUID,
    p_auth_type TEXT DEFAULT 'purchase',
    p_custom_price DECIMAL DEFAULT NULL,
    p_discount DECIMAL DEFAULT 0,
    p_valid_days INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    PERFORM verify_admin_caller();
    
    -- Verify company exists and is a company role
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_company_id AND role = 'company') THEN
        RAISE EXCEPTION 'Invalid company ID or user is not a company';
    END IF;
    
    INSERT INTO public.company_asset_authorizations (
        company_id, asset_id, authorized_by, authorization_type,
        custom_price_usd, discount_pct, valid_until
    ) VALUES (
        p_company_id, p_asset_id, auth.uid(), p_auth_type,
        p_custom_price, p_discount, now() + (p_valid_days || ' days')::interval
    )
    ON CONFLICT (company_id, asset_id) DO UPDATE SET
        authorization_type = EXCLUDED.authorization_type,
        custom_price_usd = EXCLUDED.custom_price_usd,
        discount_pct = EXCLUDED.discount_pct,
        valid_until = EXCLUDED.valid_until,
        status = 'active',
        authorized_by = auth.uid()
    RETURNING id INTO v_auth_id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, actor_id, actor_role, target_type, target_id, new_values)
    VALUES ('authorization_granted', auth.uid(), 'admin', 'authorization', v_auth_id,
            jsonb_build_object('company_id', p_company_id, 'asset_id', p_asset_id, 'type', p_auth_type));
    
    RETURN v_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke company authorization (Admin only)
CREATE OR REPLACE FUNCTION admin_revoke_authorization(
    p_auth_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    PERFORM verify_admin_caller();
    
    UPDATE public.company_asset_authorizations
    SET status = 'revoked', revocation_reason = p_reason
    WHERE id = p_auth_id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, event_severity, actor_id, actor_role, target_type, target_id, new_values)
    VALUES ('authorization_revoked', 'warning', auth.uid(), 'admin', 'authorization', p_auth_id,
            jsonb_build_object('reason', p_reason));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. COMPANY PURCHASE FUNCTION (Secure)
-- ============================================

CREATE OR REPLACE FUNCTION company_purchase_asset(
    p_asset_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_company_id UUID := auth.uid();
    v_auth RECORD;
    v_asset RECORD;
    v_final_price DECIMAL;
    v_platform_fee DECIMAL;
    v_tx_ref TEXT;
    v_access_token TEXT;
BEGIN
    -- Get asset details
    SELECT * INTO v_asset FROM public.data_assets WHERE id = p_asset_id AND visibility = 'published';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Asset not found or not available for purchase';
    END IF;
    
    -- Check authorization
    SELECT * INTO v_auth FROM public.company_asset_authorizations 
    WHERE company_id = v_company_id 
    AND asset_id = p_asset_id 
    AND status = 'active'
    AND authorization_type IN ('purchase', 'exclusive')
    AND (valid_until IS NULL OR valid_until > now());
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'You are not authorized to purchase this asset. Contact sales for access.';
    END IF;
    
    -- Calculate price (custom price or base with discount)
    IF v_auth.custom_price_usd IS NOT NULL THEN
        v_final_price := v_auth.custom_price_usd;
    ELSE
        v_final_price := v_asset.base_price_usd * (1 - (v_auth.discount_pct / 100));
    END IF;
    
    -- Platform fee (20%)
    v_platform_fee := v_final_price * 0.20;
    
    -- Generate secure transaction reference and access token
    v_tx_ref := 'XUM-TX-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 12);
    v_access_token := encode(gen_random_bytes(32), 'hex');
    
    -- Create purchase record
    INSERT INTO public.asset_purchases (
        transaction_ref, company_id, asset_id, authorization_id,
        purchase_price_usd, platform_fee_usd, worker_pool_usd,
        access_token, access_token_expires_at, expires_at
    ) VALUES (
        v_tx_ref, v_company_id, p_asset_id, v_auth.id,
        v_final_price, v_platform_fee, v_final_price - v_platform_fee,
        v_access_token, now() + interval '7 days', now() + interval '1 year'
    )
    RETURNING id INTO v_purchase_id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, event_severity, actor_id, actor_role, target_type, target_id, new_values)
    VALUES ('purchase_initiated', 'info', v_company_id, 'company', 'purchase', v_purchase_id,
            jsonb_build_object('asset_id', p_asset_id, 'amount', v_final_price));
    
    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SECURE DOWNLOAD TOKEN VALIDATION
-- ============================================

CREATE OR REPLACE FUNCTION validate_download_token(
    p_token TEXT
)
RETURNS TABLE (
    is_valid BOOLEAN,
    asset_name TEXT,
    download_url TEXT,
    remaining_downloads INTEGER
) AS $$
DECLARE
    v_purchase RECORD;
BEGIN
    SELECT ap.*, da.asset_name, da.manifest_url
    INTO v_purchase
    FROM public.asset_purchases ap
    JOIN public.data_assets da ON da.id = ap.asset_id
    WHERE ap.access_token = p_token
    AND ap.payment_status = 'paid'
    AND ap.access_token_expires_at > now()
    AND ap.download_count < ap.max_downloads;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 0;
        RETURN;
    END IF;
    
    -- Increment download count
    UPDATE public.asset_purchases 
    SET download_count = download_count + 1
    WHERE id = v_purchase.id;
    
    -- Audit log
    INSERT INTO public.marketplace_audit_log (event_type, actor_id, target_type, target_id, new_values)
    VALUES ('download_accessed', v_purchase.company_id, 'purchase', v_purchase.id,
            jsonb_build_object('download_number', v_purchase.download_count + 1));
    
    RETURN QUERY SELECT 
        true,
        v_purchase.asset_name,
        v_purchase.manifest_url,
        v_purchase.max_downloads - v_purchase.download_count - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_data_assets_visibility ON public.data_assets(visibility);
CREATE INDEX IF NOT EXISTS idx_data_assets_slug ON public.data_assets(asset_slug);
CREATE INDEX IF NOT EXISTS idx_authorizations_company ON public.company_asset_authorizations(company_id, status);
CREATE INDEX IF NOT EXISTS idx_purchases_company ON public.asset_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_purchases_token ON public.asset_purchases(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.marketplace_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON public.marketplace_audit_log(target_type, target_id);

-- ============================================
-- 10. COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.data_assets IS 'Admin-controlled data products available for sale to companies';
COMMENT ON TABLE public.company_asset_authorizations IS 'Pre-approval records for company asset purchases';
COMMENT ON TABLE public.asset_purchases IS 'Completed or pending purchase transactions';
COMMENT ON TABLE public.marketplace_audit_log IS 'Immutable audit trail for all marketplace operations';

COMMENT ON FUNCTION admin_create_data_asset IS 'Admin-only: Create a new data asset for the marketplace';
COMMENT ON FUNCTION admin_set_asset_visibility IS 'Admin-only: Publish or unpublish a data asset';
COMMENT ON FUNCTION admin_authorize_company IS 'Admin-only: Grant a company permission to purchase an asset';
COMMENT ON FUNCTION company_purchase_asset IS 'Company: Initiate purchase of an authorized asset';
COMMENT ON FUNCTION validate_download_token IS 'Validate and consume a download access token';
