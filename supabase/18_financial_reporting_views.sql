-- XUM AI Financial Reporting & Analytics Views
-- Migration: 18_financial_reporting_views.sql

-- ============================================
-- 1. DAILY PLATFORM PERFORMANCE
-- ============================================

CREATE OR REPLACE VIEW public.vw_daily_financial_performance AS
SELECT 
    date_trunc('day', created_at)::date as report_date,
    SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
    SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN type = 'revenue_share' THEN ABS(amount) ELSE 0 END) as total_worker_payouts,
    SUM(CASE WHEN type = 'data_purchase' THEN amount ELSE 0 END) as total_marketplace_revenue,
    COUNT(DISTINCT company_id) as active_companies,
    COUNT(*) as total_transactions
FROM public.financial_ledger
GROUP BY 1
ORDER BY 1 DESC;

-- ============================================
-- 2. COMPANY SPENDING ANALYTICS
-- ============================================

CREATE OR REPLACE VIEW public.vw_company_spending_summary AS
SELECT 
    u.id as company_id,
    u.full_name as company_name,
    w.available_balance,
    w.total_deposited,
    w.total_spent,
    (SELECT SUM(amount) FROM public.financial_ledger l WHERE l.company_id = u.id AND l.type = 'escrow_lock') as current_locked_funds,
    COUNT(DISTINCT l.id) as transaction_count
FROM public.users u
JOIN public.company_wallets w ON w.company_id = u.id
LEFT JOIN public.financial_ledger l ON l.company_id = u.id
WHERE u.role = 'company'
GROUP BY u.id, u.full_name, w.available_balance, w.total_deposited, w.total_spent;

-- ============================================
-- 3. WORKER EARNINGS LEADERBOARD
-- ============================================

CREATE OR REPLACE VIEW public.vw_worker_earnings_report AS
SELECT 
    u.id as worker_id,
    u.full_name,
    u.email,
    u.balance as current_balance,
    u.total_earned,
    (SELECT SUM(amount) FROM public.worker_payout_queue pq WHERE pq.user_id = u.id AND pq.status = 'pending') as pending_payouts,
    (SELECT COUNT(*) FROM public.linguasence_responses r WHERE r.user_id = u.id AND r.consensus_status = 'verified') as verified_contributions
FROM public.users u
WHERE u.role = 'worker'
ORDER BY u.total_earned DESC;

-- ============================================
-- 4. ESCROW & SETTLEMENT AUDIT
-- ============================================

CREATE OR REPLACE VIEW public.vw_escrow_reconciliation AS
SELECT 
    assignment_id,
    SUM(CASE WHEN type = 'escrow_lock' THEN amount ELSE 0 END) as locked_amount,
    SUM(CASE WHEN type = 'escrow_release' THEN ABS(amount) ELSE 0 END) as released_amount,
    SUM(CASE WHEN type = 'revenue_share' THEN ABS(amount) ELSE 0 END) as distributed_amount,
    (SUM(CASE WHEN type = 'escrow_lock' THEN amount ELSE 0 END) - 
     SUM(CASE WHEN type = 'escrow_release' THEN ABS(amount) ELSE 0 END)) as remaining_in_escrow
FROM public.financial_ledger
WHERE assignment_id IS NOT NULL
GROUP BY assignment_id;

-- ============================================
-- RLS POLICIES FOR VIEWS (Admins Only)
-- ============================================

-- Views don't support standard RLS, but we can wrap them in functions or just rely on the fact that 
-- only admins will have the keys to access these specific reporting views in the admin panel.
-- For Supabase, we can use SECURITY DEFINER functions if we want to expose them safely to researchers.

COMMENT ON VIEW public.vw_daily_financial_performance IS 'Daily aggregate of all financial movements for platform health monitoring';
COMMENT ON VIEW public.vw_company_spending_summary IS 'Detailed breakdown of company wallet health and spending patterns';
COMMENT ON VIEW public.vw_worker_earnings_report IS 'Comprehensive earning and contribution report for workers';
