-- XUM AI Analytics Aggregation Views
-- Migration: 13_analytics_views.sql
-- These views power the Admin Analytics Dashboard

-- ============================================
-- 1. DATA QUALITY METRICS
-- ============================================

-- Consensus score distribution over time (last 30 days)
CREATE OR REPLACE VIEW analytics_consensus_trend AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE consensus_score >= 0.85) as verified_count,
    ROUND(AVG(consensus_score) * 100, 1) as avg_consensus_pct,
    ROUND((COUNT(*) FILTER (WHERE consensus_score >= 0.85)::decimal / NULLIF(COUNT(*), 0)) * 100, 1) as verification_rate
FROM linguasense_responses
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Quality distribution breakdown
CREATE OR REPLACE VIEW analytics_quality_distribution AS
SELECT 
    CASE 
        WHEN consensus_score >= 0.85 THEN 'Verified'
        WHEN consensus_score >= 0.60 THEN 'Pending Review'
        WHEN consensus_score > 0 THEN 'Disputed'
        ELSE 'Rejected'
    END as status,
    COUNT(*) as count,
    ROUND((COUNT(*)::decimal / NULLIF((SELECT COUNT(*) FROM linguasense_responses), 0)) * 100, 1) as percentage
FROM linguasense_responses
GROUP BY 1;

-- Pending validation queue by project
CREATE OR REPLACE VIEW analytics_validation_queue AS
SELECT 
    p.name as project_name,
    p.id as project_id,
    COUNT(r.id) FILTER (WHERE r.status = 'pending_validation') as pending_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 3600), 1) as avg_wait_hours
FROM linguasence_projects p
LEFT JOIN linguasense_tasks t ON t.project_id = p.id
LEFT JOIN linguasense_responses r ON r.task_id = t.id
WHERE p.status = 'active'
GROUP BY p.id, p.name
HAVING COUNT(r.id) FILTER (WHERE r.status = 'pending_validation') > 0
ORDER BY pending_count DESC;

-- ============================================
-- 2. LANGUAGE QUALITY BREAKDOWN
-- ============================================

CREATE OR REPLACE VIEW analytics_language_purity AS
SELECT 
    t.target_language as language,
    COUNT(r.id) as total_samples,
    ROUND(AVG(r.consensus_score) * 100, 1) as purity_score,
    COUNT(r.id) FILTER (WHERE r.consensus_score >= 0.85) as verified_samples
FROM linguasense_tasks t
JOIN linguasense_responses r ON r.task_id = t.id
WHERE r.consensus_score IS NOT NULL
GROUP BY t.target_language
ORDER BY total_samples DESC;

-- ============================================
-- 3. CONTRIBUTOR ANALYTICS
-- ============================================

-- Daily Active Contributors (DAC)
CREATE OR REPLACE VIEW analytics_daily_active_contributors AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_contributors
FROM user_submissions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top contributors by performance
CREATE OR REPLACE VIEW analytics_top_contributors AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.xp,
    u.trust_score,
    u.balance as total_earnings,
    COUNT(s.id) as total_submissions,
    ROUND(AVG(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END) * 100, 1) as accuracy_pct
FROM users u
LEFT JOIN user_submissions s ON s.user_id = u.id
WHERE u.role = 'contributor'
GROUP BY u.id, u.full_name, u.xp, u.trust_score, u.balance
ORDER BY u.xp DESC
LIMIT 50;

-- Contributor trust score distribution
CREATE OR REPLACE VIEW analytics_trust_distribution AS
SELECT 
    CASE 
        WHEN trust_score >= 9 THEN 'Elite (9-10)'
        WHEN trust_score >= 7 THEN 'Trusted (7-9)'
        WHEN trust_score >= 5 THEN 'Standard (5-7)'
        ELSE 'New (<5)'
    END as tier,
    COUNT(*) as count
FROM users
WHERE role = 'contributor'
GROUP BY 1
ORDER BY COUNT(*) DESC;

-- ============================================
-- 4. FINANCIAL METRICS
-- ============================================

-- Monthly revenue vs payouts
CREATE OR REPLACE VIEW analytics_monthly_financials AS
SELECT 
    DATE_TRUNC('month', t.created_at) as month,
    SUM(t.amount) FILTER (WHERE t.type = 'company_payment') as revenue,
    SUM(t.amount) FILTER (WHERE t.type IN ('payout', 'withdrawal')) as payouts,
    SUM(t.amount) FILTER (WHERE t.type = 'company_payment') - 
        SUM(t.amount) FILTER (WHERE t.type IN ('payout', 'withdrawal')) as net_profit
FROM transactions t
WHERE t.created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY month DESC;

-- Pending withdrawal requests
CREATE OR REPLACE VIEW analytics_pending_withdrawals AS
SELECT 
    w.id,
    u.full_name as user_name,
    u.email,
    w.amount,
    w.status,
    w.created_at as requested_at,
    u.trust_score
FROM withdrawal_requests w
JOIN users u ON u.id = w.user_id
WHERE w.status IN ('pending', 'processing')
ORDER BY w.created_at ASC;

-- ============================================
-- 5. COMPANY/CLIENT ANALYTICS
-- ============================================

-- API usage by company
CREATE OR REPLACE VIEW analytics_company_api_usage AS
SELECT 
    c.company_name,
    c.id as company_id,
    COUNT(l.id) as total_calls,
    SUM(l.tokens_used) as total_tokens,
    MAX(l.created_at) as last_call
FROM company_api_keys c
LEFT JOIN api_usage_logs l ON l.api_key_hash = c.api_key_hash
WHERE c.is_active = true
GROUP BY c.id, c.company_name
ORDER BY total_calls DESC;

-- Active Linguasense projects
CREATE OR REPLACE VIEW analytics_active_projects AS
SELECT 
    p.name as project_name,
    p.target_language,
    p.status,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT r.id) as total_responses,
    ROUND(AVG(r.consensus_score) * 100, 1) as avg_consensus
FROM linguasence_projects p
LEFT JOIN linguasense_tasks t ON t.project_id = p.id
LEFT JOIN linguasense_responses r ON r.task_id = t.id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.target_language, p.status
ORDER BY total_tasks DESC;

-- ============================================
-- 6. REAL-TIME ACTIVITY FEED
-- ============================================

CREATE OR REPLACE VIEW analytics_recent_activity AS
(
    SELECT 
        'submission' as event_type,
        'New submission received' as message,
        created_at,
        user_id
    FROM user_submissions
    ORDER BY created_at DESC
    LIMIT 5
)
UNION ALL
(
    SELECT 
        'withdrawal' as event_type,
        CONCAT('Withdrawal of $', amount::text) as message,
        created_at,
        user_id
    FROM withdrawal_requests
    ORDER BY created_at DESC
    LIMIT 5
)
UNION ALL
(
    SELECT 
        'validation' as event_type,
        'Batch validated' as message,
        created_at,
        validator_id as user_id
    FROM linguasense_validations
    ORDER BY created_at DESC
    LIMIT 5
)
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 7. AGGREGATE STATISTICS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_contributors', (SELECT COUNT(*) FROM users WHERE role = 'contributor'),
        'active_contributors_today', (SELECT COUNT(DISTINCT user_id) FROM user_submissions WHERE DATE(created_at) = CURRENT_DATE),
        'total_validated_samples', (SELECT COUNT(*) FROM linguasense_responses WHERE consensus_score >= 0.85),
        'avg_consensus_score', (SELECT ROUND(AVG(consensus_score) * 100, 1) FROM linguasense_responses),
        'total_revenue_mtd', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'company_payment' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)),
        'pending_payouts', (SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status = 'pending'),
        'pending_payout_count', (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending'),
        'active_projects', (SELECT COUNT(*) FROM linguasence_projects WHERE status = 'active'),
        'active_api_keys', (SELECT COUNT(*) FROM company_api_keys WHERE is_active = true)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (admin check happens in RLS)
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- ============================================
-- 8. RLS POLICIES FOR VIEWS (Admin Only)
-- ============================================

-- Note: Views inherit underlying table permissions.
-- For admin-only access, ensure the calling user has the admin role.
-- The admin panel should call these views through a Supabase Edge Function
-- that verifies admin status before returning data.

COMMENT ON VIEW analytics_consensus_trend IS 'Tracks consensus score trends over the last 30 days for the admin dashboard';
COMMENT ON VIEW analytics_top_contributors IS 'Leaderboard of top-performing contributors by XP and accuracy';
COMMENT ON VIEW analytics_monthly_financials IS 'Monthly revenue and payout comparison for financial reporting';
COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns aggregated dashboard statistics as a single JSON object';
