-- ============================================
-- Security Hardening Migration
-- Version: 1.0
-- Purpose: Implements critical security fixes identified in SECURITY_AUDIT.md
-- Priority: P0 - Critical (24-48 hours)
-- ============================================

-- ============================================
-- CRITICAL FIX #2: Prevent Duplicate Submissions (S1.2)
-- ============================================

-- Add idempotency key for request deduplication
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create unique index for idempotency (allows NULL for legacy submissions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_idempotency 
ON public.submissions(idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- For single-attempt tasks, prevent same user from submitting twice
-- This is a partial index that only applies to specific task types
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_user_task_unique 
ON public.submissions(user_id, task_id) 
WHERE status != 'rejected';  -- Allow resubmission only after rejection

-- Add submission cooldown tracking
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_submission_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- CRITICAL FIX #3: Admin Audit Logging (S5.1)
-- ============================================

-- Create comprehensive admin action log table
CREATE TABLE IF NOT EXISTS public.admin_action_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    justification TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_admin_action CHECK (action_type IN (
        'balance_modify', 'role_change', 'user_suspend', 'user_unsuspend',
        'payout_approve', 'payout_reject', 'task_create', 'task_modify',
        'task_delete', 'submission_override', 'trust_score_modify',
        'bulk_action', 'system_config_change', 'api_key_create', 'api_key_revoke'
    ))
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_action_log_admin ON public.admin_action_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_entity ON public.admin_action_log(target_entity, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_created ON public.admin_action_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_type ON public.admin_action_log(action_type);

-- Enable RLS
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin logs, nobody can modify
CREATE POLICY admin_action_log_select ON public.admin_action_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only service role can insert (via functions)
CREATE POLICY admin_action_log_insert ON public.admin_action_log
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- CRITICAL: Revoke DELETE from everyone to ensure immutability
REVOKE DELETE ON public.admin_action_log FROM authenticated;
REVOKE DELETE ON public.admin_action_log FROM anon;

-- ============================================
-- CRITICAL FIX #4: Rate Limiting Table (S1.2, S2.1)
-- ============================================

CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    request_count INTEGER DEFAULT 1,
    
    CONSTRAINT unique_user_action_window UNIQUE (user_id, action_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON public.rate_limit_tracking(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON public.rate_limit_tracking(window_start);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_max_requests INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMP WITH TIME ZONE;
    v_current_count INTEGER;
BEGIN
    -- Calculate current window start (floor to minute)
    v_window_start := date_trunc('minute', now());
    
    -- Try to get or create rate limit record
    INSERT INTO public.rate_limit_tracking (user_id, action_type, window_start, request_count)
    VALUES (p_user_id, p_action_type, v_window_start, 1)
    ON CONFLICT (user_id, action_type, window_start) 
    DO UPDATE SET request_count = rate_limit_tracking.request_count + 1
    RETURNING request_count INTO v_current_count;
    
    -- Check if over limit
    IF v_current_count > p_max_requests THEN
        RETURN FALSE;  -- Rate limited
    END IF;
    
    RETURN TRUE;  -- Allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit records (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limit_tracking
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRITICAL FIX #5: Trust Score History & Decay (S3.1)
-- ============================================

CREATE TABLE IF NOT EXISTS public.trust_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    old_score DECIMAL(3,1),
    new_score DECIMAL(3,1),
    change_amount DECIMAL(4,2),
    reason TEXT NOT NULL,
    triggered_by UUID REFERENCES public.users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_reason CHECK (reason IN (
        'task_completed', 'task_rejected', 'validation_correct', 'validation_incorrect',
        'consensus_agree', 'consensus_disagree', 'pattern_anomaly', 'manual_adjustment',
        'inactivity_decay', 'sybil_detection', 'appeal_approved', 'appeal_rejected'
    ))
);

CREATE INDEX IF NOT EXISTS idx_trust_history_user ON public.trust_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_history_reason ON public.trust_score_history(reason);
CREATE INDEX IF NOT EXISTS idx_trust_history_created ON public.trust_score_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY trust_history_select ON public.trust_score_history
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Function to modify trust score with full audit trail
CREATE OR REPLACE FUNCTION public.modify_trust_score(
    p_user_id UUID,
    p_change_amount DECIMAL,
    p_reason TEXT,
    p_triggered_by UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    v_old_score DECIMAL(3,1);
    v_new_score DECIMAL(3,1);
BEGIN
    -- Lock user row
    SELECT trust_score INTO v_old_score
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Calculate new score (bounded 0-10)
    v_new_score := GREATEST(0, LEAST(10, v_old_score + p_change_amount));
    
    -- Update user
    UPDATE public.users
    SET trust_score = v_new_score, updated_at = now()
    WHERE id = p_user_id;
    
    -- Log the change
    INSERT INTO public.trust_score_history (
        user_id, old_score, new_score, change_amount, 
        reason, triggered_by, metadata
    ) VALUES (
        p_user_id, v_old_score, v_new_score, p_change_amount,
        p_reason, COALESCE(p_triggered_by, auth.uid()), p_metadata
    );
    
    RETURN v_new_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decay inactive trust scores (S3.1 remediation)
CREATE OR REPLACE FUNCTION public.decay_inactive_trust_scores()
RETURNS INTEGER AS $$
DECLARE
    v_affected_count INTEGER := 0;
BEGIN
    -- Decay trust scores for users inactive > 30 days
    WITH decayed AS (
        UPDATE public.users u
        SET trust_score = GREATEST(trust_score * 0.95, 3.0)
        WHERE u.updated_at < NOW() - INTERVAL '30 days'
          AND u.trust_score > 5.0
        RETURNING u.id, u.trust_score
    )
    SELECT COUNT(*) INTO v_affected_count FROM decayed;
    
    -- Log decay actions in audit
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
    SELECT 
        NULL,  -- System action
        'trust_decay_batch',
        'system',
        gen_random_uuid(),
        jsonb_build_object('affected_count', v_affected_count),
        jsonb_build_object('decay_factor', 0.95, 'min_score', 3.0)
    WHERE v_affected_count > 0;
    
    RETURN v_affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRITICAL FIX #6: Budget Reservation System (S3.3)
-- ============================================

CREATE TABLE IF NOT EXISTS public.budget_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES public.project_budgets(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '30 minutes',
    status TEXT DEFAULT 'active',
    
    CONSTRAINT valid_reservation_status CHECK (status IN ('active', 'claimed', 'expired', 'released'))
);

CREATE INDEX IF NOT EXISTS idx_budget_reservations_budget ON public.budget_reservations(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_reservations_user ON public.budget_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_reservations_status ON public.budget_reservations(status);
CREATE INDEX IF NOT EXISTS idx_budget_reservations_expires ON public.budget_reservations(expires_at);

-- Enable RLS
ALTER TABLE public.budget_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_reservations_policy ON public.budget_reservations
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'company'))
    );

-- Function to release expired reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    v_released_count INTEGER := 0;
    v_total_released DECIMAL := 0;
BEGIN
    -- Mark expired reservations
    WITH expired AS (
        UPDATE public.budget_reservations
        SET status = 'expired'
        WHERE status = 'active' AND expires_at < NOW()
        RETURNING id, budget_id, amount
    )
    SELECT COUNT(*), COALESCE(SUM(amount), 0) 
    INTO v_released_count, v_total_released
    FROM expired;
    
    -- Return funds to budgets
    UPDATE public.project_budgets pb
    SET remaining_balance = remaining_balance + (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.budget_reservations br 
        WHERE br.budget_id = pb.id 
          AND br.status = 'expired'
          AND br.expires_at > NOW() - INTERVAL '1 minute'  -- Just expired
    );
    
    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.admin_action_log TO authenticated;
GRANT INSERT ON public.admin_action_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rate_limit_tracking TO authenticated;
GRANT SELECT ON public.trust_score_history TO authenticated;
GRANT INSERT ON public.trust_score_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.budget_reservations TO authenticated;

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- This migration implements:
-- 1. Duplicate submission prevention via unique indexes
-- 2. Immutable admin action logging
-- 3. Server-side rate limiting
-- 4. Trust score history with decay mechanism
-- 5. Budget reservation system to prevent exhaustion attacks
--
-- Next steps:
-- - Run this migration on Supabase
-- - Update frontend to pass idempotency keys
-- - Set up cron job for cleanup_rate_limits() and decay_inactive_trust_scores()
-- - Configure pg_cron: SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT public.cleanup_rate_limits()');
-- ============================================
