-- ============================================
-- Analytics Schema for XUM AI Company Portal
-- Version: 1.0
-- Purpose: Support real-time analytics, metrics, and reporting
-- ============================================

-- 1. Company Projects Table (Campaigns)
CREATE TABLE IF NOT EXISTS public.company_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Project Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL, -- 'voice_collection', 'image_labeling', 'rlhf', 'text_annotation', 'validation'
    
    -- Status & Timeline
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Budget & Financials
    total_budget DECIMAL(12,2) DEFAULT 0.00,
    spent_budget DECIMAL(12,2) DEFAULT 0.00,
    escrow_amount DECIMAL(12,2) DEFAULT 0.00,
    cost_per_task DECIMAL(10,4) DEFAULT 0.00,
    
    -- Metrics
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    pending_tasks INTEGER DEFAULT 0,
    rejected_tasks INTEGER DEFAULT 0,
    
    -- Quality
    target_accuracy DECIMAL(5,2) DEFAULT 95.00,
    current_accuracy DECIMAL(5,2) DEFAULT 0.00,
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_project_type CHECK (project_type IN ('voice_collection', 'image_labeling', 'rlhf', 'text_annotation', 'validation')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_company_projects_company_id ON public.company_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_company_projects_status ON public.company_projects(status);
CREATE INDEX IF NOT EXISTS idx_company_projects_type ON public.company_projects(project_type);

-- 2. Analytics Events Table (Event Sourcing)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.company_projects(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(100) NOT NULL, -- 'submission_received', 'submission_approved', 'submission_rejected', 'worker_joined', 'payment_processed', etc.
    event_category VARCHAR(50) NOT NULL, -- 'submission', 'financial', 'worker', 'quality', 'system'
    
    -- Event Data
    event_data JSONB NOT NULL DEFAULT '{}',
    
    -- Context
    user_id UUID REFERENCES public.users(id),
    session_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_event_category CHECK (event_category IN ('submission', 'financial', 'worker', 'quality', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_company_id ON public.analytics_events(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_project_id ON public.analytics_events(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON public.analytics_events(event_category);

-- 3. Daily Metrics Aggregation (Pre-computed for performance)
CREATE TABLE IF NOT EXISTS public.analytics_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.company_projects(id) ON DELETE SET NULL,
    
    -- Time Period
    metric_date DATE NOT NULL,
    
    -- Submission Metrics
    total_submissions INTEGER DEFAULT 0,
    approved_submissions INTEGER DEFAULT 0,
    rejected_submissions INTEGER DEFAULT 0,
    pending_submissions INTEGER DEFAULT 0,
    
    -- Quality Metrics
    average_accuracy DECIMAL(5,2) DEFAULT 0.00,
    consensus_rate DECIMAL(5,2) DEFAULT 0.00,
    first_pass_yield DECIMAL(5,2) DEFAULT 0.00,
    
    -- Time Metrics
    avg_turnaround_hours DECIMAL(10,2) DEFAULT 0.00,
    avg_time_per_task_seconds INTEGER DEFAULT 0,
    
    -- Worker Metrics
    active_workers INTEGER DEFAULT 0,
    new_workers INTEGER DEFAULT 0,
    returning_workers INTEGER DEFAULT 0,
    
    -- Financial Metrics
    total_spend DECIMAL(12,2) DEFAULT 0.00,
    cost_per_approved DECIMAL(10,4) DEFAULT 0.00,
    payout_to_workers DECIMAL(12,2) DEFAULT 0.00,
    
    -- Geographic Distribution (JSON)
    geo_distribution JSONB DEFAULT '{}',
    
    -- Hourly Breakdown (JSON)
    hourly_breakdown JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(company_id, project_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_company_date ON public.analytics_daily_metrics(company_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_project_date ON public.analytics_daily_metrics(project_id, metric_date);

-- 4. Worker Performance Metrics (Per Company)
CREATE TABLE IF NOT EXISTS public.worker_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.company_projects(id) ON DELETE SET NULL,
    
    -- Performance Metrics
    total_submissions INTEGER DEFAULT 0,
    approved_submissions INTEGER DEFAULT 0,
    rejected_submissions INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Speed Metrics
    avg_time_per_task_seconds INTEGER DEFAULT 0,
    total_time_spent_seconds INTEGER DEFAULT 0,
    
    -- Quality Trend
    quality_trend DECIMAL(5,2) DEFAULT 0.00, -- +/- percentage change
    
    -- Financial
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status
    is_top_performer BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    
    -- Metadata
    first_submission_at TIMESTAMP WITH TIME ZONE,
    last_submission_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(company_id, worker_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_perf_company ON public.worker_performance_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_perf_worker ON public.worker_performance_metrics(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_perf_accuracy ON public.worker_performance_metrics(accuracy_rate);

-- 5. Company Benchmarks (Industry Comparison)
CREATE TABLE IF NOT EXISTS public.company_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Ranking
    global_rank INTEGER,
    percentile DECIMAL(5,2), -- e.g., 95.5 means top 4.5%
    tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
    
    -- Comparative Metrics
    throughput_score DECIMAL(5,2) DEFAULT 0.00,
    quality_score DECIMAL(5,2) DEFAULT 0.00,
    speed_score DECIMAL(5,2) DEFAULT 0.00,
    retention_score DECIMAL(5,2) DEFAULT 0.00,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Industry Averages (for comparison)
    industry_avg_accuracy DECIMAL(5,2) DEFAULT 0.00,
    industry_avg_turnaround DECIMAL(10,2) DEFAULT 0.00,
    industry_avg_cost_per_task DECIMAL(10,4) DEFAULT 0.00,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_company ON public.company_benchmarks(company_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_period ON public.company_benchmarks(period_start, period_end);

-- 6. Scheduled Reports Configuration
CREATE TABLE IF NOT EXISTS public.analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Report Details
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'daily_summary', 'weekly_digest', 'monthly_overview', 'custom'
    
    -- Configuration
    metrics_included JSONB NOT NULL DEFAULT '[]', -- Array of metric keys to include
    filters JSONB DEFAULT '{}',
    
    -- Schedule
    schedule_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'on_demand'
    schedule_day INTEGER, -- Day of week (1-7) or day of month (1-31)
    schedule_time TIME DEFAULT '09:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'email', -- 'email', 'slack', 'webhook'
    delivery_config JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_report_type CHECK (report_type IN ('daily_summary', 'weekly_digest', 'monthly_overview', 'custom')),
    CONSTRAINT valid_frequency CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'on_demand'))
);

CREATE INDEX IF NOT EXISTS idx_reports_company ON public.analytics_reports(company_id);

-- ============================================
-- FUNCTIONS: Analytics Aggregation
-- ============================================

-- Function: Calculate daily metrics for a company
CREATE OR REPLACE FUNCTION calculate_daily_metrics(
    p_company_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS void AS $$
DECLARE
    v_total_submissions INTEGER;
    v_approved INTEGER;
    v_rejected INTEGER;
    v_pending INTEGER;
    v_avg_accuracy DECIMAL;
    v_avg_turnaround DECIMAL;
    v_active_workers INTEGER;
    v_total_spend DECIMAL;
BEGIN
    -- Calculate submission counts
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE s.status = 'approved'),
        COUNT(*) FILTER (WHERE s.status = 'rejected'),
        COUNT(*) FILTER (WHERE s.status = 'pending')
    INTO v_total_submissions, v_approved, v_rejected, v_pending
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE t.created_by = p_company_id
    AND DATE(s.submitted_at) = p_date;
    
    -- Calculate average accuracy
    SELECT COALESCE(AVG(quality_score) * 100, 0)
    INTO v_avg_accuracy
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE t.created_by = p_company_id
    AND DATE(s.submitted_at) = p_date
    AND s.quality_score IS NOT NULL;
    
    -- Calculate active workers
    SELECT COUNT(DISTINCT user_id)
    INTO v_active_workers
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE t.created_by = p_company_id
    AND DATE(s.submitted_at) = p_date;
    
    -- Insert or update daily metrics
    INSERT INTO public.analytics_daily_metrics (
        company_id,
        metric_date,
        total_submissions,
        approved_submissions,
        rejected_submissions,
        pending_submissions,
        average_accuracy,
        active_workers
    ) VALUES (
        p_company_id,
        p_date,
        v_total_submissions,
        v_approved,
        v_rejected,
        v_pending,
        v_avg_accuracy,
        v_active_workers
    )
    ON CONFLICT (company_id, project_id, metric_date) 
    DO UPDATE SET
        total_submissions = EXCLUDED.total_submissions,
        approved_submissions = EXCLUDED.approved_submissions,
        rejected_submissions = EXCLUDED.rejected_submissions,
        pending_submissions = EXCLUDED.pending_submissions,
        average_accuracy = EXCLUDED.average_accuracy,
        active_workers = EXCLUDED.active_workers,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function: Get analytics overview for company dashboard
CREATE OR REPLACE FUNCTION get_company_analytics_overview(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', (
            SELECT COUNT(*) FROM public.company_projects WHERE company_id = p_company_id
        ),
        'active_projects', (
            SELECT COUNT(*) FROM public.company_projects WHERE company_id = p_company_id AND status = 'active'
        ),
        'total_submissions', (
            SELECT COALESCE(SUM(total_submissions), 0) 
            FROM public.analytics_daily_metrics 
            WHERE company_id = p_company_id
        ),
        'total_approved', (
            SELECT COALESCE(SUM(approved_submissions), 0) 
            FROM public.analytics_daily_metrics 
            WHERE company_id = p_company_id
        ),
        'avg_accuracy', (
            SELECT COALESCE(ROUND(AVG(average_accuracy), 2), 0) 
            FROM public.analytics_daily_metrics 
            WHERE company_id = p_company_id
            AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
        ),
        'total_workers', (
            SELECT COUNT(DISTINCT worker_id) 
            FROM public.worker_performance_metrics 
            WHERE company_id = p_company_id
        ),
        'top_performers', (
            SELECT COUNT(*) 
            FROM public.worker_performance_metrics 
            WHERE company_id = p_company_id AND is_top_performer = true
        ),
        'total_spend', (
            SELECT COALESCE(SUM(spent_budget), 0) 
            FROM public.company_projects 
            WHERE company_id = p_company_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get time series data for charts
CREATE OR REPLACE FUNCTION get_analytics_time_series(
    p_company_id UUID,
    p_days INTEGER DEFAULT 7,
    p_project_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'date', metric_date,
            'submissions', total_submissions,
            'approved', approved_submissions,
            'rejected', rejected_submissions,
            'accuracy', average_accuracy,
            'workers', active_workers,
            'spend', total_spend
        ) ORDER BY metric_date
    )
    INTO result
    FROM public.analytics_daily_metrics
    WHERE company_id = p_company_id
    AND metric_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    AND (p_project_id IS NULL OR project_id = p_project_id);
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- Function: Get geographic distribution
CREATE OR REPLACE FUNCTION get_geo_distribution(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'country', u.location,
            'workers', COUNT(DISTINCT wpm.worker_id),
            'submissions', SUM(wpm.total_submissions),
            'accuracy', ROUND(AVG(wpm.accuracy_rate), 2)
        )
    )
    INTO result
    FROM public.worker_performance_metrics wpm
    JOIN public.users u ON wpm.worker_id = u.id
    WHERE wpm.company_id = p_company_id
    AND u.location IS NOT NULL
    GROUP BY u.location
    ORDER BY SUM(wpm.total_submissions) DESC
    LIMIT 10;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies for Analytics Tables
-- ============================================

ALTER TABLE public.company_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- Company Projects: Companies can manage their own projects
CREATE POLICY company_projects_policy ON public.company_projects
    FOR ALL USING (
        company_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Analytics Events: Companies can view their own events
CREATE POLICY analytics_events_policy ON public.analytics_events
    FOR SELECT USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Daily Metrics: Companies can view their own metrics
CREATE POLICY daily_metrics_policy ON public.analytics_daily_metrics
    FOR SELECT USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Worker Performance: Companies can view workers on their projects
CREATE POLICY worker_perf_policy ON public.worker_performance_metrics
    FOR SELECT USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Benchmarks: Companies can view their own benchmarks
CREATE POLICY benchmarks_policy ON public.company_benchmarks
    FOR SELECT USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Reports: Companies can manage their own reports
CREATE POLICY reports_policy ON public.analytics_reports
    FOR ALL USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_projects TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT SELECT ON public.analytics_daily_metrics TO authenticated;
GRANT SELECT ON public.worker_performance_metrics TO authenticated;
GRANT SELECT ON public.company_benchmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_reports TO authenticated;
