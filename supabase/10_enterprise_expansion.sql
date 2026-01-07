-- Enterprise & Collaborative Infrastructure
-- Version: 1.0

-- 1. Teams & Shared Projects
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'member', 'admin'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

-- 2. SLAs & Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.project_budgets(id),
    terms TEXT NOT NULL,
    status TEXT DEFAULT 'pending_signature', -- 'signed', 'expired', 'terminated'
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Webhooks & API Integration
CREATE TABLE IF NOT EXISTS public.company_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id),
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[], -- ['submission.approved', 'payout.processed']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Dataset Marketplace Listing
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id UUID REFERENCES public.dataset_exports(id),
    price DECIMAL(12,2) NOT NULL,
    description TEXT,
    sample_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. RLHF Specific Profiles
CREATE TABLE IF NOT EXISTS public.rlhf_calibration (
    user_id UUID PRIMARY KEY REFERENCES public.users(id),
    domain TEXT, -- 'code', 'math', 'creative', 'logic'
    bias_score DECIMAL(3,2), -- measure of alignment with gold standards
    speed_percentile INTEGER,
    last_calibrated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
