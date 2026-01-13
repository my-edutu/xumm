-- ============================================================================
-- LEADERBOARD SYSTEM
-- Ranks users by their total earnings for admin visibility
-- Created: 2026-01-10
-- ============================================================================

-- Create leaderboard view (auto-updates with rankings)
CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.created_at as member_since,
    COALESCE(earnings.total_earned, 0) as total_earned,
    COALESCE(earnings.today_earned, 0) as today_earned,
    COALESCE(earnings.week_earned, 0) as week_earned,
    COALESCE(earnings.month_earned, 0) as month_earned,
    COALESCE(earnings.total_tasks, 0) as total_tasks,
    RANK() OVER (ORDER BY COALESCE(earnings.total_earned, 0) DESC) as global_rank,
    RANK() OVER (ORDER BY COALESCE(earnings.today_earned, 0) DESC) as today_rank,
    RANK() OVER (ORDER BY COALESCE(earnings.week_earned, 0) DESC) as week_rank
FROM public.profiles p
LEFT JOIN (
    SELECT 
        user_id,
        SUM(CASE WHEN status = 'approved' THEN total_reward ELSE 0 END) as total_earned,
        SUM(CASE WHEN status = 'approved' AND created_at >= CURRENT_DATE THEN total_reward ELSE 0 END) as today_earned,
        SUM(CASE WHEN status = 'approved' AND created_at >= CURRENT_DATE - INTERVAL '7 days' THEN total_reward ELSE 0 END) as week_earned,
        SUM(CASE WHEN status = 'approved' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total_reward ELSE 0 END) as month_earned,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as total_tasks
    FROM public.task_submissions
    GROUP BY user_id
) earnings ON earnings.user_id = p.id
WHERE p.role = 'user'
ORDER BY global_rank;

-- Get total user count for display
CREATE OR REPLACE FUNCTION get_leaderboard_stats()
RETURNS TABLE (
    total_users INTEGER,
    total_earned_all DECIMAL(10, 2),
    active_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE role = 'user') as total_users,
        (SELECT COALESCE(SUM(total_reward), 0) FROM public.task_submissions WHERE status = 'approved') as total_earned_all,
        (SELECT COUNT(DISTINCT user_id)::INTEGER FROM public.task_submissions WHERE created_at >= CURRENT_DATE) as active_today;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's rank and nearby users
CREATE OR REPLACE FUNCTION get_user_rank_context(p_user_id UUID)
RETURNS TABLE (
    user_rank INTEGER,
    total_users INTEGER,
    user_earned DECIMAL(10, 2),
    percentile DECIMAL(5, 2)
) AS $$
DECLARE
    v_rank INTEGER;
    v_total INTEGER;
    v_earned DECIMAL(10, 2);
BEGIN
    -- Get user's rank
    SELECT global_rank, total_earned INTO v_rank, v_earned
    FROM public.user_leaderboard
    WHERE id = p_user_id;
    
    -- Get total users
    SELECT COUNT(*)::INTEGER INTO v_total
    FROM public.profiles WHERE role = 'user';
    
    RETURN QUERY
    SELECT 
        COALESCE(v_rank, v_total),
        v_total,
        COALESCE(v_earned, 0),
        CASE WHEN v_total > 0 THEN ROUND(((v_total - COALESCE(v_rank, v_total))::DECIMAL / v_total * 100), 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for leaderboard view access
CREATE POLICY "Anyone can view leaderboard"
ON public.profiles
FOR SELECT
USING (true);

-- ============================================================================
-- ADMIN FUNCTIONS
-- ============================================================================

-- Admin view of all users with rankings
CREATE OR REPLACE VIEW public.admin_user_rankings AS
SELECT 
    ul.*,
    p.email,
    p.role,
    (SELECT COUNT(*) FROM public.task_submissions ts WHERE ts.user_id = ul.id AND ts.status = 'pending') as pending_reviews,
    (SELECT SUM(total_reward) FROM public.task_submissions ts WHERE ts.user_id = ul.id AND ts.reward_paid = false AND ts.status = 'approved') as unpaid_balance
FROM public.user_leaderboard ul
JOIN auth.users au ON au.id = ul.id
JOIN public.profiles p ON p.id = ul.id;

-- Only admins can access this view
-- (Access controlled at application level since views can't have RLS directly)

COMMENT ON VIEW public.user_leaderboard IS 'Public leaderboard showing user rankings by earnings';
COMMENT ON VIEW public.admin_user_rankings IS 'Admin-only view with full user details and rankings';
COMMENT ON FUNCTION get_user_rank_context IS 'Get a user rank and percentile for display';
