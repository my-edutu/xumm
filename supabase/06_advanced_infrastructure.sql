-- Advanced Infrastructure for XUM AI
-- Version: 1.2
-- Implementation of recommendations from MISSING_INFRASTRUCTURE.md

-- 1. Temporal Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'task', 'user', 'submission', 'payout', 'setting'
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- 2. Financial Escrow & Project Budgets
CREATE TABLE IF NOT EXISTS public.project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    total_budget DECIMAL(12,2) NOT NULL,
    remaining_balance DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'depleted', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Link tasks to budgets
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES public.project_budgets(id);

-- 3. Consensus Engine Infrastructure
CREATE TABLE IF NOT EXISTS public.consensus_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id),
    required_redundancy INTEGER DEFAULT 3,
    status TEXT DEFAULT 'collecting', -- 'collecting', 'computing', 'resolved', 'disputed'
    final_output JSONB,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Link submissions to consensus groups
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS consensus_group_id UUID REFERENCES public.consensus_groups(id);

-- 4. Dispute Resolution (Appeals)
CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed'
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(submission_id) -- Only one appeal per submission
);

-- 5. Support Messaging (Admin-to-Company/User)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id), -- Requester
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    message TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Trigger for Audit Logging (Example for platform_settings)
CREATE OR REPLACE FUNCTION public.log_setting_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (
        auth.uid(),
        'update',
        'setting',
        NULL,
        to_jsonb(OLD),
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_setting_updated
    AFTER UPDATE ON public.platform_settings
    FOR EACH ROW EXECUTE FUNCTION public.log_setting_change();

-- 7. Reputation History
CREATE TABLE IF NOT EXISTS public.reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    score_delta DECIMAL(3,1),
    reason TEXT,
    reference_id UUID, -- Submission ID or Task ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Enforcement
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consensus_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Admins see everything
CREATE POLICY "Admins see all audit logs" ON public.audit_logs FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins see all budgets" ON public.project_budgets FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins see all appeals" ON public.appeals FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Users/Companies see their own
CREATE POLICY "Users see own appeals" ON public.appeals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies see own budgets" ON public.project_budgets FOR SELECT USING (auth.uid() = company_id);
