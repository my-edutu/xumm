-- XUM AI Network Sync SQL
-- Real-time worker data for Company Network tab and Admin Panel
-- Version: 1.0

-- ============================================
-- COMPANY NETWORK VIEW (Limited Info)
-- Companies can see workers who worked on their tasks
-- ============================================
DROP VIEW IF EXISTS public.company_network_workers CASCADE;
CREATE VIEW public.company_network_workers AS
SELECT 
    u.id AS worker_id,
    u.full_name,
    u.avatar_url,
    u.level,
    u.trust_score,
    u.created_at AS joined_at,
    
    -- Worker's performance on THIS company's tasks only
    worker_stats.tasks_completed,
    worker_stats.approval_rate,
    worker_stats.avg_quality_score,
    worker_stats.last_active,
    
    -- Company reference (for RLS filtering)
    t.company_id
    
FROM public.users u
JOIN public.submissions s ON u.id = s.user_id
JOIN public.tasks t ON s.task_id = t.id
LEFT JOIN (
    SELECT 
        s2.user_id,
        t2.company_id,
        COUNT(DISTINCT s2.task_id) AS tasks_completed,
        ROUND((COUNT(*) FILTER (WHERE s2.status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 1) AS approval_rate,
        ROUND(AVG(COALESCE(s2.quality_score, 80)), 1) AS avg_quality_score,
        MAX(s2.submitted_at) AS last_active
    FROM public.submissions s2
    JOIN public.tasks t2 ON s2.task_id = t2.id
    GROUP BY s2.user_id, t2.company_id
) worker_stats ON u.id = worker_stats.user_id AND t.company_id = worker_stats.company_id
WHERE u.role = 'contributor'
GROUP BY u.id, u.full_name, u.avatar_url, u.level, u.trust_score, u.created_at,
         worker_stats.tasks_completed, worker_stats.approval_rate, worker_stats.avg_quality_score, 
         worker_stats.last_active, t.company_id;

-- ============================================
-- ADMIN NETWORK VIEW (Full Info)
-- Admins see ALL worker data across the platform
-- ============================================
DROP VIEW IF EXISTS public.admin_network_workers CASCADE;
CREATE VIEW public.admin_network_workers AS
SELECT 
    u.id AS worker_id,
    u.email,
    u.full_name,
    u.avatar_url,
    u.role,
    u.level,
    u.current_xp,
    u.target_xp,
    u.trust_score,
    u.balance,
    u.total_earned,
    u.is_active,
    u.created_at AS joined_at,
    u.updated_at AS last_updated,
    
    -- Comprehensive submission stats
    COALESCE(stats.total_submissions, 0) AS total_submissions,
    COALESCE(stats.approved_submissions, 0) AS approved_submissions,
    COALESCE(stats.pending_submissions, 0) AS pending_submissions,
    COALESCE(stats.rejected_submissions, 0) AS rejected_submissions,
    COALESCE(stats.approval_rate, 0) AS approval_rate,
    stats.last_submission,
    stats.first_submission,
    
    -- Task variety
    COALESCE(stats.unique_tasks_worked, 0) AS unique_tasks_worked,
    COALESCE(stats.unique_companies_worked, 0) AS unique_companies_worked,
    
    -- Financial stats
    COALESCE(payout.pending_payout, 0) AS pending_payout,
    COALESCE(payout.total_withdrawn, 0) AS total_withdrawn,
    
    -- Flags/Issues
    COALESCE(flags.flag_count, 0) AS flag_count,
    COALESCE(appeals.appeal_count, 0) AS appeal_count
    
FROM public.users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_submissions,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_submissions,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_submissions,
        ROUND((COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 1) AS approval_rate,
        MAX(submitted_at) AS last_submission,
        MIN(submitted_at) AS first_submission,
        COUNT(DISTINCT task_id) AS unique_tasks_worked,
        COUNT(DISTINCT (SELECT company_id FROM public.tasks WHERE id = task_id)) AS unique_companies_worked
    FROM public.submissions
    GROUP BY user_id
) stats ON u.id = stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount) FILTER (WHERE status = 'pending') AS pending_payout,
        SUM(amount) FILTER (WHERE status IN ('approved', 'paid')) AS total_withdrawn
    FROM public.worker_payout_queue
    GROUP BY user_id
) payout ON u.id = payout.user_id
LEFT JOIN (
    SELECT 
        s.user_id,
        COUNT(*) AS flag_count
    FROM public.flagged_submissions fs
    JOIN public.submissions s ON fs.submission_id = s.id
    WHERE fs.resolved = false
    GROUP BY s.user_id
) flags ON u.id = flags.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS appeal_count
    FROM public.rating_appeals
    WHERE status = 'pending'
    GROUP BY user_id
) appeals ON u.id = appeals.user_id
WHERE u.role = 'contributor';

-- ============================================
-- REAL-TIME NETWORK STATS (For Dashboard Cards)
-- ============================================
DROP VIEW IF EXISTS public.network_realtime_stats CASCADE;
CREATE VIEW public.network_realtime_stats AS
SELECT 
    -- Total workers
    (SELECT COUNT(*) FROM public.users WHERE role = 'contributor') AS total_workers,
    
    -- Active workers (worked in last 24h)
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions 
     WHERE submitted_at >= NOW() - INTERVAL '24 hours') AS active_24h,
    
    -- Active workers (worked in last 7 days)
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions 
     WHERE submitted_at >= NOW() - INTERVAL '7 days') AS active_7d,
    
    -- New workers this week
    (SELECT COUNT(*) FROM public.users 
     WHERE role = 'contributor' AND created_at >= NOW() - INTERVAL '7 days') AS new_workers_week,
    
    -- Average trust score
    ROUND((SELECT AVG(trust_score) FROM public.users WHERE role = 'contributor'), 1) AS avg_trust_score,
    
    -- Total submissions today
    (SELECT COUNT(*) FROM public.submissions 
     WHERE submitted_at >= CURRENT_DATE) AS submissions_today,
    
    -- Approval rate (last 7 days)
    ROUND((SELECT COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0) * 100
           FROM public.submissions WHERE submitted_at >= NOW() - INTERVAL '7 days'), 1) AS approval_rate_7d,
    
    -- Workers online now (submitted in last 15 minutes - approximation)
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions 
     WHERE submitted_at >= NOW() - INTERVAL '15 minutes') AS online_now;

-- ============================================
-- COMPANY-SPECIFIC NETWORK STATS
-- For the Network tab in Company Portal
-- ============================================
DROP FUNCTION IF EXISTS public.get_company_network_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_company_network_stats(p_company_id UUID)
RETURNS TABLE (
    total_workers BIGINT,
    active_workers BIGINT,
    avg_approval_rate DECIMAL,
    total_submissions BIGINT,
    top_worker_name TEXT,
    top_worker_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s.user_id)::BIGINT AS total_workers,
        COUNT(DISTINCT s.user_id) FILTER (WHERE s.submitted_at >= NOW() - INTERVAL '7 days')::BIGINT AS active_workers,
        ROUND(AVG(
            CASE WHEN s.status = 'approved' THEN 100.0 ELSE 0.0 END
        ), 1) AS avg_approval_rate,
        COUNT(s.id)::BIGINT AS total_submissions,
        (SELECT u.full_name FROM public.users u 
         JOIN public.submissions s2 ON u.id = s2.user_id 
         JOIN public.tasks t2 ON s2.task_id = t2.id
         WHERE t2.company_id = p_company_id
         GROUP BY u.id, u.full_name
         ORDER BY COUNT(*) DESC LIMIT 1) AS top_worker_name,
        (SELECT u.id FROM public.users u 
         JOIN public.submissions s2 ON u.id = s2.user_id 
         JOIN public.tasks t2 ON s2.task_id = t2.id
         WHERE t2.company_id = p_company_id
         GROUP BY u.id
         ORDER BY COUNT(*) DESC LIMIT 1) AS top_worker_id
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE t.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- WORKER ACTIVITY STREAM (Real-time feed)
-- ============================================
DROP VIEW IF EXISTS public.worker_activity_stream CASCADE;
CREATE VIEW public.worker_activity_stream AS
SELECT 
    s.id AS activity_id,
    s.user_id AS worker_id,
    u.full_name AS worker_name,
    u.avatar_url AS worker_avatar,
    u.level AS worker_level,
    t.id AS task_id,
    t.title AS task_title,
    t.company_id,
    c.full_name AS company_name,
    s.status AS submission_status,
    s.quality_score,
    s.submitted_at,
    CASE 
        WHEN s.submitted_at >= NOW() - INTERVAL '1 minute' THEN 'Just now'
        WHEN s.submitted_at >= NOW() - INTERVAL '1 hour' THEN EXTRACT(MINUTE FROM NOW() - s.submitted_at)::TEXT || 'm ago'
        WHEN s.submitted_at >= NOW() - INTERVAL '24 hours' THEN EXTRACT(HOUR FROM NOW() - s.submitted_at)::TEXT || 'h ago'
        ELSE TO_CHAR(s.submitted_at, 'Mon DD')
    END AS time_ago
FROM public.submissions s
JOIN public.users u ON s.user_id = u.id
JOIN public.tasks t ON s.task_id = t.id
LEFT JOIN public.companies c ON t.company_id = c.id
ORDER BY s.submitted_at DESC
LIMIT 100;

-- ============================================
-- RLS for Company Network Access
-- Companies can only see workers who worked on their tasks
-- ============================================
DROP POLICY IF EXISTS "Companies see their network" ON public.company_network_workers;
-- Note: This is a view, RLS is handled by the underlying tables

-- ============================================
-- SUPABASE REALTIME SETUP
-- Enable realtime for key tables
-- ============================================
-- Run these in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON public.submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- ============================================
-- QUALITY SCORE COLUMN (if missing)
-- ============================================
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 80;
