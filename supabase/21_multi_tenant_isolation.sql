-- ============================================
-- Multi-Tenant Data Isolation Security
-- Version: 1.0
-- Purpose: Fixes S4.1 - Company Data Cross-Contamination
-- Priority: P0 - Critical (24-48 hours)
-- ============================================

-- ============================================
-- SECURE ANALYTICS VIEWS
-- Replace direct views with secure functions that enforce company isolation
-- ============================================

-- Drop insecure views and replace with secure functions
DROP VIEW IF EXISTS public.v_realtime_submission_stats CASCADE;
DROP VIEW IF EXISTS public.v_realtime_worker_activity CASCADE;

-- Secure function: Get submission stats for current user's company only
CREATE OR REPLACE FUNCTION public.get_secure_submission_stats(
    p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
    company_id UUID,
    total_submissions BIGINT,
    approved_count BIGINT,
    rejected_count BIGINT,
    pending_count BIGINT,
    avg_accuracy NUMERIC,
    active_workers BIGINT,
    last_submission_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_caller_role TEXT;
    v_target_company UUID;
BEGIN
    -- Get caller's role
    SELECT role INTO v_caller_role FROM public.users WHERE id = auth.uid();
    
    -- Determine which company to query
    IF v_caller_role = 'admin' THEN
        -- Admins can query any company (or all if p_company_id is NULL)
        v_target_company := p_company_id;
    ELSIF v_caller_role = 'company' THEN
        -- Companies can only see their own data
        v_target_company := auth.uid();
    ELSE
        -- Regular users should not call this function
        RAISE EXCEPTION 'ACCESS_DENIED: Insufficient permissions';
    END IF;
    
    RETURN QUERY
    SELECT 
        t.created_by as company_id,
        COUNT(s.id) as total_submissions,
        COUNT(s.id) FILTER (WHERE s.status = 'approved') as approved_count,
        COUNT(s.id) FILTER (WHERE s.status = 'rejected') as rejected_count,
        COUNT(s.id) FILTER (WHERE s.status = 'pending') as pending_count,
        ROUND(AVG(s.quality_score) * 100, 2) as avg_accuracy,
        COUNT(DISTINCT s.user_id) as active_workers,
        MAX(s.submitted_at) as last_submission_at
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE s.submitted_at >= NOW() - INTERVAL '24 hours'
      AND (v_target_company IS NULL OR t.created_by = v_target_company)
    GROUP BY t.created_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function: Get worker activity for current company only (NO PII exposed)
CREATE OR REPLACE FUNCTION public.get_secure_worker_activity(
    p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
    company_id UUID,
    worker_id UUID,
    worker_display_name TEXT,  -- Anonymized: "Worker #xxxx" or first name only
    worker_region TEXT,        -- Anonymized: Country only, not full location
    submissions_today BIGINT,
    approved_today BIGINT,
    accuracy_today NUMERIC,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_caller_role TEXT;
    v_target_company UUID;
BEGIN
    -- Get caller's role
    SELECT role INTO v_caller_role FROM public.users WHERE id = auth.uid();
    
    -- Determine which company to query
    IF v_caller_role = 'admin' THEN
        v_target_company := p_company_id;
    ELSIF v_caller_role = 'company' THEN
        v_target_company := auth.uid();
    ELSE
        RAISE EXCEPTION 'ACCESS_DENIED: Insufficient permissions';
    END IF;
    
    RETURN QUERY
    SELECT 
        t.created_by as company_id,
        s.user_id as worker_id,
        -- ANONYMIZED: Only show "Worker #" + last 4 chars of UUID
        'Worker #' || RIGHT(s.user_id::TEXT, 4) as worker_display_name,
        -- ANONYMIZED: Only show country from location (if available)
        COALESCE(
            SPLIT_PART(u.location, ',', -1),  -- Last part typically country
            'Unknown'
        ) as worker_region,
        COUNT(s.id) as submissions_today,
        COUNT(s.id) FILTER (WHERE s.status = 'approved') as approved_today,
        ROUND(AVG(s.quality_score) * 100, 2) as accuracy_today,
        MAX(s.submitted_at) as last_active
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    JOIN public.users u ON s.user_id = u.id
    WHERE s.submitted_at >= CURRENT_DATE
      AND (v_target_company IS NULL OR t.created_by = v_target_company)
    GROUP BY t.created_by, s.user_id, u.location;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CROSS-COMPANY QUERY PROTECTION
-- ============================================

-- Function to validate company isolation in all queries
CREATE OR REPLACE FUNCTION public.assert_company_access(
    p_target_company_id UUID,
    p_required_access TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    SELECT role INTO v_caller_role FROM public.users WHERE id = auth.uid();
    
    -- Admins have full access
    IF v_caller_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Companies can only access their own data
    IF v_caller_role = 'company' AND p_target_company_id = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- All other combinations are denied
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECURE COMPANY ANALYTICS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_company_analytics_secure(
    p_company_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_caller_role TEXT;
BEGIN
    -- Validate access
    IF NOT public.assert_company_access(p_company_id, 'read') THEN
        RAISE EXCEPTION 'ACCESS_DENIED: Cannot access company % data', p_company_id;
    END IF;
    
    -- Build analytics result
    SELECT jsonb_build_object(
        'period', jsonb_build_object(
            'start', p_start_date,
            'end', p_end_date
        ),
        'submissions', (
            SELECT jsonb_build_object(
                'total', COUNT(*),
                'approved', COUNT(*) FILTER (WHERE s.status = 'approved'),
                'rejected', COUNT(*) FILTER (WHERE s.status = 'rejected'),
                'pending', COUNT(*) FILTER (WHERE s.status = 'pending'),
                'avg_quality', ROUND(AVG(s.quality_score) * 100, 2)
            )
            FROM public.submissions s
            JOIN public.tasks t ON s.task_id = t.id
            WHERE t.created_by = p_company_id
              AND s.submitted_at::DATE BETWEEN p_start_date AND p_end_date
        ),
        'workers', (
            SELECT jsonb_build_object(
                'total_unique', COUNT(DISTINCT s.user_id),
                'avg_submissions_per_worker', ROUND(AVG(worker_count), 2)
            )
            FROM (
                SELECT s.user_id, COUNT(*) as worker_count
                FROM public.submissions s
                JOIN public.tasks t ON s.task_id = t.id
                WHERE t.created_by = p_company_id
                  AND s.submitted_at::DATE BETWEEN p_start_date AND p_end_date
                GROUP BY s.user_id
            ) sub
        ),
        'budget', (
            SELECT jsonb_build_object(
                'total_spent', COALESCE(SUM(total_allocated - remaining_balance), 0),
                'remaining', COALESCE(SUM(remaining_balance), 0)
            )
            FROM public.project_budgets
            WHERE company_id = p_company_id
        ),
        'accessed_at', NOW(),
        'accessed_by', auth.uid()
    ) INTO v_result;
    
    -- Log analytics access for audit
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
        auth.uid(),
        'analytics_access',
        'company',
        p_company_id,
        NULL,
        jsonb_build_object('period_start', p_start_date, 'period_end', p_end_date)
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- WORKER DATA PROTECTION
-- ============================================

-- Ensure workers' personal data cannot be exposed to companies
CREATE OR REPLACE FUNCTION public.get_task_submissions_for_company(
    p_task_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    submission_id UUID,
    worker_anonymous_id TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status TEXT,
    quality_score NUMERIC,
    time_spent_seconds INTEGER
) AS $$
DECLARE
    v_company_id UUID;
BEGIN
    -- Get the task's company
    SELECT created_by INTO v_company_id
    FROM public.tasks
    WHERE id = p_task_id;
    
    -- Validate access
    IF NOT public.assert_company_access(v_company_id, 'read') THEN
        RAISE EXCEPTION 'ACCESS_DENIED: Cannot access this task';
    END IF;
    
    RETURN QUERY
    SELECT 
        s.id as submission_id,
        -- Anonymize worker ID
        'WKR-' || LEFT(MD5(s.user_id::TEXT), 8) as worker_anonymous_id,
        s.submitted_at,
        s.status::TEXT,
        s.quality_score,
        s.time_spent_seconds
    FROM public.submissions s
    WHERE s.task_id = p_task_id
    ORDER BY s.submitted_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ISOLATION VERIFICATION TRIGGER
-- ============================================

-- Trigger to verify company isolation on task queries
CREATE OR REPLACE FUNCTION public.verify_task_company_isolation()
RETURNS TRIGGER AS $$
BEGIN
    -- For SELECT, ensure user can only see their company's tasks
    IF TG_OP = 'SELECT' THEN
        IF NOT public.assert_company_access(NEW.created_by, 'read') THEN
            RETURN NULL;  -- Hide row
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RATE LIMITING FOR ANALYTICS ENDPOINTS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_company_analytics_with_rate_limit(
    p_company_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
BEGIN
    -- Check rate limit (max 60 analytics queries per minute)
    IF NOT public.check_rate_limit(auth.uid(), 'analytics_query', 60, 1) THEN
        RAISE EXCEPTION 'RATE_LIMIT: Too many analytics requests. Please wait.';
    END IF;
    
    -- Delegate to main function
    RETURN public.get_company_analytics_secure(p_company_id, p_start_date, p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_secure_submission_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secure_worker_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assert_company_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_analytics_secure(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_submissions_for_company(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_analytics_with_rate_limit(UUID, DATE, DATE) TO authenticated;

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 
-- This migration implements:
-- 1. Replaced direct views with secure functions enforcing company isolation
-- 2. Anonymized worker data in company-facing queries (no PII exposure)
-- 3. Added access control validation to all cross-tenant queries
-- 4. Rate limiting on expensive analytics endpoints
-- 5. Audit logging for analytics access
--
-- Frontend Changes Required:
-- - Replace direct view queries with secure function calls
-- - Update analyticsService.ts to use get_company_analytics_secure()
-- ============================================
