-- ============================================================================
-- 009: UNIFIED MULTI-TENANCY & COMPATIBILITY LAYER
-- Harmonizes existing 'users', 'tasks', 'submissions' with mobile 'profiles', etc.
-- Created: 2026-01-10
-- ============================================================================

-- 1. COMPATIBILITY VIEWS (Bridge for Mobile App)
-- This allows the mobile app code to keep using 'profiles', 'capture_prompts', etc.
CREATE OR REPLACE VIEW public.profiles AS 
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    level, 
    current_xp, 
    target_xp, 
    trust_score, 
    avatar_url, 
    created_at, 
    updated_at 
FROM public.users;

CREATE OR REPLACE VIEW public.capture_prompts AS 
SELECT 
    id, 
    task_type::text::public.capture_task_type as task_type, 
    title as prompt_text, 
    description as category, -- Mapping category to description for now
    ''::text as hint_text, 
    reward as base_reward, 
    0.00::decimal as bonus_reward, 
    'en'::text as language_code, 
    null::text as region_code, 
    0 as display_order, 
    (status = 'active') as is_active, 
    created_at, 
    updated_at, 
    created_by, 
    null::uuid as updated_by
FROM public.tasks;

-- 2. NEW MULTI-TENANCY TABLES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    billing_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE public.company_role AS ENUM ('owner', 'admin', 'manager', 'viewer');

CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role public.company_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status public.campaign_status DEFAULT 'draft',
    total_budget DECIMAL(12, 2) DEFAULT 0.00,
    spent_budget DECIMAL(12, 2) DEFAULT 0.00,
    target_submissions INTEGER DEFAULT 1000,
    current_submissions INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LINK EXISTING TABLES TO MULTI-TENANCY
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'campaign_id') THEN
        ALTER TABLE public.tasks ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'company_id') THEN
        ALTER TABLE public.tasks ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. RLS POLICIES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public companies viewable by active users" 
ON public.companies FOR SELECT USING (is_active = true);

CREATE POLICY "Admins full access to companies"
ON public.companies FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Company members can see own memberships"
ON public.company_members FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 5. Helper Function: Audit for Campaigns
CREATE OR REPLACE FUNCTION public.sync_campaign_submissions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        UPDATE public.campaigns
        SET current_submissions = current_submissions + 1
        WHERE id = (SELECT campaign_id FROM public.tasks WHERE id = NEW.task_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_campaign_stats ON public.submissions;
CREATE TRIGGER tr_sync_campaign_stats
    AFTER UPDATE OF status ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_campaign_submissions();

-- COMMENTS
COMMENT ON TABLE public.companies IS 'Shared across Company and Admin portals';
COMMENT ON VIEW public.profiles IS 'Compatibility view for XUM AI Mobile App';
