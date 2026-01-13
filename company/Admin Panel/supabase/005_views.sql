-- Analytics Views for XUM AI
-- Version: 2.2

-- 1. Company Projects View
DROP VIEW IF EXISTS public.company_projects CASCADE;
CREATE VIEW public.company_projects AS
SELECT 
    id,
    company_id,
    title AS name,
    status,
    task_type AS project_type,
    COALESCE(target_submissions, 1000) AS total_tasks,
    COALESCE(current_submissions, 0) AS completed_tasks,
    (COALESCE(target_submissions, 1000) - COALESCE(current_submissions, 0)) AS pending_tasks,
    98.5 AS current_accuracy,
    COALESCE(total_budget, 0) AS total_budget,
    (COALESCE(current_submissions, 0) * COALESCE(reward_per_submission, 0.05)) AS spent_budget,
    created_at
FROM public.tasks;

-- 2. Worker Performance Metrics
DROP VIEW IF EXISTS public.worker_performance_metrics CASCADE;
CREATE VIEW public.worker_performance_metrics AS
SELECT 
    s.user_id AS worker_id,
    t.company_id,
    COUNT(s.id) AS total_submissions,
    COUNT(s.id) FILTER (WHERE s.status = 'approved') AS approved_submissions,
    ROUND((COUNT(s.id) FILTER (WHERE s.status = 'approved')::DECIMAL / NULLIF(COUNT(s.id), 0) * 100), 2) AS accuracy_rate,
    60 AS avg_time_per_task_seconds,
    COALESCE(SUM(COALESCE(t.reward_per_submission, 0.05)) FILTER (WHERE s.status = 'approved'), 0) AS total_earned,
    MAX(s.submitted_at) AS last_submission_at
FROM public.submissions s
JOIN public.tasks t ON s.task_id = t.id
GROUP BY s.user_id, t.company_id;

-- 3. Daily Metrics for Time Series
DROP VIEW IF EXISTS public.analytics_daily_metrics CASCADE;
CREATE VIEW public.analytics_daily_metrics AS
SELECT 
    t.company_id,
    s.submitted_at::DATE AS metric_date,
    COUNT(*) FILTER (WHERE s.status = 'approved') AS approved_submissions,
    COUNT(*) FILTER (WHERE s.status = 'pending') AS pending_submissions,
    COUNT(*) FILTER (WHERE s.status = 'rejected') AS rejected_submissions
FROM public.submissions s
JOIN public.tasks t ON s.task_id = t.id
GROUP BY t.company_id, s.submitted_at::DATE;
