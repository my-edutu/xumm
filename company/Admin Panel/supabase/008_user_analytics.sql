-- XUM AI User/Worker Analytics for Admin
-- Version: 1.0 - Stats visible from Admin Panel about Mobile App Users

-- ============================================
-- USER GROWTH ANALYTICS
-- ============================================
DROP VIEW IF EXISTS public.admin_user_growth CASCADE;
CREATE VIEW public.admin_user_growth AS
SELECT 
    -- Total Counts
    (SELECT COUNT(*) FROM public.users) AS total_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'contributor') AS total_workers,
    (SELECT COUNT(*) FROM public.users WHERE role = 'company') AS total_companies,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') AS total_admins,
    
    -- Active Users (logged in within 30 days)
    (SELECT COUNT(*) FROM public.users WHERE is_active = true) AS active_users,
    
    -- New Users (this week)
    (SELECT COUNT(*) FROM public.users 
     WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS new_users_week,
    
    -- New Users (this month)
    (SELECT COUNT(*) FROM public.users 
     WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS new_users_month,
    
    -- Verified Users
    (SELECT COUNT(*) FROM public.users WHERE is_active = true) AS verified_users;

-- ============================================
-- WORKER LEADERBOARD (Top Performers)
-- ============================================
DROP VIEW IF EXISTS public.admin_worker_leaderboard CASCADE;
CREATE VIEW public.admin_worker_leaderboard AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    u.level,
    u.trust_score,
    u.balance AS current_balance,
    u.total_earned,
    u.current_xp,
    u.created_at AS member_since,
    
    -- Submission stats
    COALESCE(stats.total_submissions, 0) AS total_submissions,
    COALESCE(stats.approved_submissions, 0) AS approved_submissions,
    COALESCE(stats.rejected_submissions, 0) AS rejected_submissions,
    ROUND(COALESCE(stats.approval_rate, 0), 1) AS approval_rate,
    
    -- Rank by earnings
    RANK() OVER (ORDER BY u.total_earned DESC) AS earnings_rank,
    
    -- Rank by submissions
    RANK() OVER (ORDER BY COALESCE(stats.total_submissions, 0) DESC) AS submissions_rank

FROM public.users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_submissions,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_submissions,
        (COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0)) * 100 AS approval_rate
    FROM public.submissions
    GROUP BY user_id
) stats ON u.id = stats.user_id
WHERE u.role = 'contributor'
ORDER BY u.total_earned DESC;

-- ============================================
-- WORKER ACTIVITY HEATMAP (By Hour/Day)
-- ============================================
DROP FUNCTION IF EXISTS public.get_worker_activity_heatmap();
CREATE OR REPLACE FUNCTION public.get_worker_activity_heatmap()
RETURNS TABLE (
    day_of_week INTEGER,
    hour_of_day INTEGER,
    submission_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM submitted_at)::INTEGER AS dow,
        EXTRACT(HOUR FROM submitted_at)::INTEGER AS hod,
        COUNT(*) AS cnt
    FROM public.submissions
    WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 1, 2
    ORDER BY 1, 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EARNINGS DISTRIBUTION
-- ============================================
DROP VIEW IF EXISTS public.admin_earnings_distribution CASCADE;
CREATE VIEW public.admin_earnings_distribution AS
SELECT 
    CASE 
        WHEN total_earned = 0 THEN '$0'
        WHEN total_earned < 10 THEN '$1-$10'
        WHEN total_earned < 50 THEN '$10-$50'
        WHEN total_earned < 100 THEN '$50-$100'
        WHEN total_earned < 500 THEN '$100-$500'
        ELSE '$500+'
    END AS earnings_bracket,
    COUNT(*) AS user_count,
    SUM(total_earned) AS bracket_total
FROM public.users
WHERE role = 'contributor'
GROUP BY 1
ORDER BY 
    CASE 
        WHEN total_earned = 0 THEN 0
        WHEN total_earned < 10 THEN 1
        WHEN total_earned < 50 THEN 2
        WHEN total_earned < 100 THEN 3
        WHEN total_earned < 500 THEN 4
        ELSE 5
    END;

-- ============================================
-- LEVEL DISTRIBUTION
-- ============================================
DROP VIEW IF EXISTS public.admin_level_distribution CASCADE;
CREATE VIEW public.admin_level_distribution AS
SELECT 
    level,
    COUNT(*) AS user_count,
    ROUND(AVG(trust_score), 1) AS avg_trust_score,
    ROUND(AVG(total_earned), 2) AS avg_earnings
FROM public.users
WHERE role = 'contributor'
GROUP BY level
ORDER BY level;

-- ============================================
-- DAILY USER SIGNUP TREND (Last 30 days)
-- ============================================
DROP FUNCTION IF EXISTS public.get_signup_trend(INTEGER);
CREATE OR REPLACE FUNCTION public.get_signup_trend(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    signup_date DATE,
    new_workers BIGINT,
    new_companies BIGINT,
    cumulative_total BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        SELECT generate_series(
            CURRENT_DATE - (p_days - 1) * INTERVAL '1 day', 
            CURRENT_DATE, 
            INTERVAL '1 day'
        )::DATE AS d
    ),
    daily_signups AS (
        SELECT 
            created_at::DATE AS signup_day,
            COUNT(*) FILTER (WHERE role = 'contributor') AS workers,
            COUNT(*) FILTER (WHERE role = 'company') AS companies
        FROM public.users
        WHERE created_at >= CURRENT_DATE - p_days * INTERVAL '1 day'
        GROUP BY 1
    )
    SELECT 
        dates.d,
        COALESCE(ds.workers, 0),
        COALESCE(ds.companies, 0),
        SUM(COALESCE(ds.workers, 0) + COALESCE(ds.companies, 0)) OVER (ORDER BY dates.d)
    FROM dates
    LEFT JOIN daily_signups ds ON dates.d = ds.signup_day
    ORDER BY dates.d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TASK TYPE PERFORMANCE BY WORKERS
-- ============================================
DROP VIEW IF EXISTS public.admin_task_type_performance CASCADE;
CREATE VIEW public.admin_task_type_performance AS
SELECT 
    t.task_type,
    COUNT(DISTINCT s.user_id) AS unique_workers,
    COUNT(s.id) AS total_submissions,
    COUNT(s.id) FILTER (WHERE s.status = 'approved') AS approved,
    ROUND((COUNT(s.id) FILTER (WHERE s.status = 'approved')::DECIMAL / NULLIF(COUNT(s.id), 0)) * 100, 1) AS approval_rate,
    COALESCE(SUM(t.reward_per_submission) FILTER (WHERE s.status = 'approved'), 0) AS total_paid
FROM public.tasks t
JOIN public.submissions s ON t.id = s.task_id
GROUP BY t.task_type
ORDER BY total_submissions DESC;

-- ============================================
-- WORKER RETENTION METRICS
-- ============================================
DROP VIEW IF EXISTS public.admin_worker_retention CASCADE;
CREATE VIEW public.admin_worker_retention AS
SELECT 
    -- Workers who submitted in last 7 days
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions 
     WHERE submitted_at >= CURRENT_DATE - INTERVAL '7 days') AS active_7d,
    
    -- Workers who submitted in last 30 days
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions 
     WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days') AS active_30d,
    
    -- Total workers who ever submitted
    (SELECT COUNT(DISTINCT user_id) FROM public.submissions) AS ever_active,
    
    -- Workers who signed up but never submitted
    (SELECT COUNT(*) FROM public.users u
     WHERE u.role = 'contributor' 
     AND NOT EXISTS (SELECT 1 FROM public.submissions s WHERE s.user_id = u.id)) AS never_submitted,
    
    -- Average submissions per active worker (30d)
    ROUND((SELECT COUNT(*)::DECIMAL FROM public.submissions 
           WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days') /
          NULLIF((SELECT COUNT(DISTINCT user_id) FROM public.submissions 
                  WHERE submitted_at >= CURRENT_DATE - INTERVAL '30 days'), 0), 1) AS avg_submissions_30d;

-- ============================================
-- COMPREHENSIVE USER DETAIL VIEW (For Admin User Page)
-- ============================================
DROP VIEW IF EXISTS public.admin_user_details CASCADE;
CREATE VIEW public.admin_user_details AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.level,
    u.current_xp,
    u.target_xp,
    u.trust_score,
    u.balance,
    u.total_earned,
    u.avatar_url,
    u.is_active,
    u.created_at,
    u.updated_at,
    
    -- Submission metrics
    COALESCE(sub.total, 0) AS total_submissions,
    COALESCE(sub.approved, 0) AS approved_submissions,
    COALESCE(sub.pending, 0) AS pending_submissions,
    COALESCE(sub.rejected, 0) AS rejected_submissions,
    sub.last_submission,
    
    -- Withdrawal metrics
    COALESCE(wd.total_withdrawn, 0) AS total_withdrawn,
    COALESCE(wd.pending_withdrawals, 0) AS pending_withdrawals
    
FROM public.users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
        MAX(submitted_at) AS last_submission
    FROM public.submissions
    GROUP BY user_id
) sub ON u.id = sub.user_id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount) FILTER (WHERE status = 'approved' OR status = 'paid') AS total_withdrawn,
        SUM(amount) FILTER (WHERE status = 'pending') AS pending_withdrawals
    FROM public.worker_payout_queue
    GROUP BY user_id
) wd ON u.id = wd.user_id;

-- ============================================
-- PLATFORM HEALTH SUMMARY (Executive Dashboard)
-- ============================================
DROP VIEW IF EXISTS public.admin_platform_health CASCADE;
CREATE VIEW public.admin_platform_health AS
SELECT 
    -- User Health
    (SELECT COUNT(*) FROM public.users) AS total_users,
    (SELECT COUNT(*) FROM public.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS new_users_7d,
    
    -- Task Health
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'active') AS active_tasks,
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending_review') AS pending_review_tasks,
    
    -- Submission Health
    (SELECT COUNT(*) FROM public.submissions WHERE submitted_at >= CURRENT_DATE) AS submissions_today,
    (SELECT COUNT(*) FROM public.submissions WHERE status = 'pending') AS pending_reviews,
    
    -- Financial Health
    COALESCE((SELECT SUM(available_balance) FROM public.company_wallets), 0) AS total_company_liquidity,
    COALESCE((SELECT SUM(amount) FROM public.escrow_ledger WHERE status = 'locked'), 0) AS total_escrow,
    COALESCE((SELECT SUM(balance) FROM public.users WHERE role = 'contributor'), 0) AS total_worker_balances,
    COALESCE((SELECT SUM(amount) FROM public.worker_payout_queue WHERE status = 'pending'), 0) AS pending_payouts,
    
    -- Quality Health
    ROUND((SELECT COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0) * 100 
           FROM public.submissions), 1) AS global_approval_rate,
    ROUND((SELECT AVG(trust_score) FROM public.users WHERE role = 'contributor'), 1) AS avg_trust_score;
