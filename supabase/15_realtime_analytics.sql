-- ============================================
-- Real-Time Analytics & Notifications Schema
-- Version: 1.1
-- Purpose: Real-time subscriptions, email reports, anomaly detection
-- ============================================

-- ============================================
-- 1. REAL-TIME ANALYTICS VIEWS
-- ============================================

-- Real-time submission stats view (for live updates)
CREATE OR REPLACE VIEW public.v_realtime_submission_stats AS
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
GROUP BY t.created_by;

-- Real-time worker activity view
CREATE OR REPLACE VIEW public.v_realtime_worker_activity AS
SELECT 
    t.created_by as company_id,
    s.user_id as worker_id,
    u.full_name as worker_name,
    u.location as worker_location,
    COUNT(s.id) as submissions_today,
    COUNT(s.id) FILTER (WHERE s.status = 'approved') as approved_today,
    ROUND(AVG(s.quality_score) * 100, 2) as accuracy_today,
    MAX(s.submitted_at) as last_active
FROM public.submissions s
JOIN public.tasks t ON s.task_id = t.id
JOIN public.users u ON s.user_id = u.id
WHERE s.submitted_at >= CURRENT_DATE
GROUP BY t.created_by, s.user_id, u.full_name, u.location;

-- ============================================
-- 2. ANOMALY DETECTION TABLES
-- ============================================

-- Anomaly thresholds configuration per company
CREATE TABLE IF NOT EXISTS public.anomaly_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Quality Thresholds
    min_accuracy_threshold DECIMAL(5,2) DEFAULT 85.00,
    accuracy_drop_threshold DECIMAL(5,2) DEFAULT 5.00, -- Alert if accuracy drops by this %
    
    -- Volume Thresholds  
    min_daily_submissions INTEGER DEFAULT 100,
    max_rejection_rate DECIMAL(5,2) DEFAULT 15.00,
    
    -- Time Thresholds
    max_turnaround_hours INTEGER DEFAULT 48,
    inactivity_alert_hours INTEGER DEFAULT 24,
    
    -- Worker Thresholds
    min_worker_accuracy DECIMAL(5,2) DEFAULT 80.00,
    suspicious_speed_threshold INTEGER DEFAULT 5, -- Submissions per minute (too fast = suspicious)
    
    -- Notification Settings
    notify_on_critical BOOLEAN DEFAULT true,
    notify_on_warning BOOLEAN DEFAULT true,
    notify_email VARCHAR(255),
    notify_slack_webhook TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(company_id)
);

-- Detected anomalies log
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.company_projects(id) ON DELETE SET NULL,
    worker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL, -- 'accuracy_drop', 'high_rejection', 'suspicious_activity', 'inactivity', 'threshold_breach'
    severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Metrics at time of alert
    metric_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    comparison_period VARCHAR(50), -- '1h', '24h', '7d'
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_by UUID REFERENCES public.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('accuracy_drop', 'high_rejection', 'suspicious_activity', 'inactivity', 'threshold_breach', 'quality_anomaly', 'volume_spike', 'worker_flagged')),
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_company ON public.anomaly_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_status ON public.anomaly_alerts(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_created ON public.anomaly_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_severity ON public.anomaly_alerts(severity);

-- ============================================
-- 3. EMAIL REPORT SCHEDULING
-- ============================================

-- Enhanced scheduled reports table
CREATE TABLE IF NOT EXISTS public.scheduled_email_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Report Configuration
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'daily_digest', 'weekly_summary', 'monthly_overview', 'anomaly_report', 'worker_performance'
    
    -- Metrics to include (JSON array of metric keys)
    included_metrics JSONB DEFAULT '["submissions", "accuracy", "workers", "spend"]',
    
    -- Filters
    project_filter UUID[], -- NULL = all projects
    date_range_days INTEGER DEFAULT 7,
    
    -- Schedule
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'realtime'
    schedule_time TIME DEFAULT '09:00:00',
    schedule_day_of_week INTEGER, -- 1-7 for weekly (1=Monday)
    schedule_day_of_month INTEGER, -- 1-31 for monthly
    timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
    
    -- Recipients
    recipients JSONB NOT NULL, -- [{"email": "...", "name": "..."}]
    cc_emails TEXT[], -- Additional CC recipients
    
    -- Email Template
    email_subject_template VARCHAR(255) DEFAULT 'XUM Analytics Report - {{report_name}} - {{date}}',
    include_charts BOOLEAN DEFAULT true,
    include_csv_attachment BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_scheduled_at TIMESTAMP WITH TIME ZONE,
    send_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_report_type CHECK (report_type IN ('daily_digest', 'weekly_summary', 'monthly_overview', 'anomaly_report', 'worker_performance', 'financial_summary', 'custom')),
    CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'realtime'))
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_company ON public.scheduled_email_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next ON public.scheduled_email_reports(next_scheduled_at);

-- Email send log
CREATE TABLE IF NOT EXISTS public.email_report_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.scheduled_email_reports(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Email Details
    recipients TEXT[] NOT NULL,
    subject VARCHAR(255) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'failed', 'bounced'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Report snapshot (for historical reference)
    report_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_email_status CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'bounced'))
);

CREATE INDEX IF NOT EXISTS idx_email_log_report ON public.email_report_log(report_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_report_log(status);

-- ============================================
-- 4. REAL-TIME NOTIFICATION PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Channel Preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    slack_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Alert Type Preferences
    alert_accuracy_drop BOOLEAN DEFAULT true,
    alert_high_rejection BOOLEAN DEFAULT true,
    alert_suspicious_activity BOOLEAN DEFAULT true,
    alert_milestone_reached BOOLEAN DEFAULT true,
    alert_budget_warning BOOLEAN DEFAULT true,
    alert_project_complete BOOLEAN DEFAULT true,
    
    -- Digest Preferences
    daily_digest_enabled BOOLEAN DEFAULT false,
    weekly_digest_enabled BOOLEAN DEFAULT true,
    digest_time TIME DEFAULT '09:00:00',
    
    -- Contact Info
    notification_email VARCHAR(255),
    phone_number VARCHAR(20),
    slack_user_id VARCHAR(50),
    
    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_start TIME DEFAULT '22:00:00',
    quiet_end TIME DEFAULT '08:00:00',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(user_id, company_id)
);

-- ============================================
-- 5. ANOMALY DETECTION FUNCTIONS
-- ============================================

-- Function: Check for accuracy anomalies
CREATE OR REPLACE FUNCTION check_accuracy_anomalies()
RETURNS TABLE (
    company_id UUID,
    current_accuracy DECIMAL,
    previous_accuracy DECIMAL,
    accuracy_drop DECIMAL,
    should_alert BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            t.created_by as company_id,
            ROUND(AVG(s.quality_score) * 100, 2) as avg_accuracy
        FROM public.submissions s
        JOIN public.tasks t ON s.task_id = t.id
        WHERE s.submitted_at >= NOW() - INTERVAL '24 hours'
        GROUP BY t.created_by
    ),
    previous_period AS (
        SELECT 
            t.created_by as company_id,
            ROUND(AVG(s.quality_score) * 100, 2) as avg_accuracy
        FROM public.submissions s
        JOIN public.tasks t ON s.task_id = t.id
        WHERE s.submitted_at >= NOW() - INTERVAL '48 hours'
        AND s.submitted_at < NOW() - INTERVAL '24 hours'
        GROUP BY t.created_by
    )
    SELECT 
        c.company_id,
        c.avg_accuracy as current_accuracy,
        COALESCE(p.avg_accuracy, c.avg_accuracy) as previous_accuracy,
        COALESCE(p.avg_accuracy - c.avg_accuracy, 0) as accuracy_drop,
        CASE 
            WHEN c.avg_accuracy < COALESCE(at.min_accuracy_threshold, 85) THEN true
            WHEN COALESCE(p.avg_accuracy - c.avg_accuracy, 0) > COALESCE(at.accuracy_drop_threshold, 5) THEN true
            ELSE false
        END as should_alert
    FROM current_period c
    LEFT JOIN previous_period p ON c.company_id = p.company_id
    LEFT JOIN public.anomaly_thresholds at ON c.company_id = at.company_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Check for suspicious worker activity
CREATE OR REPLACE FUNCTION check_suspicious_activity()
RETURNS TABLE (
    company_id UUID,
    worker_id UUID,
    worker_name TEXT,
    submissions_per_minute DECIMAL,
    is_suspicious BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH worker_rates AS (
        SELECT 
            t.created_by as company_id,
            s.user_id as worker_id,
            u.full_name as worker_name,
            COUNT(s.id)::DECIMAL / GREATEST(EXTRACT(EPOCH FROM (MAX(s.submitted_at) - MIN(s.submitted_at))) / 60, 1) as spm
        FROM public.submissions s
        JOIN public.tasks t ON s.task_id = t.id
        JOIN public.users u ON s.user_id = u.id
        WHERE s.submitted_at >= NOW() - INTERVAL '1 hour'
        GROUP BY t.created_by, s.user_id, u.full_name
        HAVING COUNT(s.id) >= 5
    )
    SELECT 
        wr.company_id,
        wr.worker_id,
        wr.worker_name,
        ROUND(wr.spm, 2) as submissions_per_minute,
        wr.spm > COALESCE(at.suspicious_speed_threshold, 5) as is_suspicious
    FROM worker_rates wr
    LEFT JOIN public.anomaly_thresholds at ON wr.company_id = at.company_id
    WHERE wr.spm > COALESCE(at.suspicious_speed_threshold, 5);
END;
$$ LANGUAGE plpgsql;

-- Function: Create anomaly alert
CREATE OR REPLACE FUNCTION create_anomaly_alert(
    p_company_id UUID,
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_metric_value DECIMAL DEFAULT NULL,
    p_threshold_value DECIMAL DEFAULT NULL,
    p_worker_id UUID DEFAULT NULL,
    p_project_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO public.anomaly_alerts (
        company_id,
        project_id,
        worker_id,
        alert_type,
        severity,
        title,
        description,
        metric_value,
        threshold_value
    ) VALUES (
        p_company_id,
        p_project_id,
        p_worker_id,
        p_alert_type,
        p_severity,
        p_title,
        p_description,
        p_metric_value,
        p_threshold_value
    )
    RETURNING id INTO v_alert_id;
    
    -- Also create a notification for the company users
    INSERT INTO public.notifications (user_id, title, message, type, action_url)
    SELECT 
        u.id,
        p_title,
        p_description,
        'admin_message',
        '/analytics/alerts/' || v_alert_id::TEXT
    FROM public.users u
    WHERE u.id = p_company_id OR u.role = 'admin';
    
    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get active alerts for company
CREATE OR REPLACE FUNCTION get_company_alerts(
    p_company_id UUID,
    p_status VARCHAR DEFAULT 'active',
    p_limit INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', aa.id,
            'type', aa.alert_type,
            'severity', aa.severity,
            'title', aa.title,
            'description', aa.description,
            'metric_value', aa.metric_value,
            'threshold_value', aa.threshold_value,
            'status', aa.status,
            'created_at', aa.created_at,
            'worker_name', u.full_name
        ) ORDER BY aa.created_at DESC
    )
    INTO result
    FROM public.anomaly_alerts aa
    LEFT JOIN public.users u ON aa.worker_id = u.id
    WHERE aa.company_id = p_company_id
    AND (p_status IS NULL OR aa.status = p_status)
    LIMIT p_limit;
    
    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate next scheduled time for report
CREATE OR REPLACE FUNCTION calculate_next_schedule(
    p_frequency VARCHAR,
    p_schedule_time TIME,
    p_day_of_week INTEGER,
    p_day_of_month INTEGER,
    p_timezone VARCHAR
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    v_next_run TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE;
BEGIN
    v_now := NOW() AT TIME ZONE COALESCE(p_timezone, 'UTC');
    
    CASE p_frequency
        WHEN 'daily' THEN
            v_next_run := DATE(v_now) + p_schedule_time;
            IF v_next_run <= v_now THEN
                v_next_run := v_next_run + INTERVAL '1 day';
            END IF;
            
        WHEN 'weekly' THEN
            v_next_run := DATE(v_now) + ((p_day_of_week - EXTRACT(DOW FROM v_now) + 7)::INTEGER % 7) * INTERVAL '1 day' + p_schedule_time;
            IF v_next_run <= v_now THEN
                v_next_run := v_next_run + INTERVAL '7 days';
            END IF;
            
        WHEN 'monthly' THEN
            v_next_run := DATE_TRUNC('month', v_now) + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day' + p_schedule_time;
            IF v_next_run <= v_now THEN
                v_next_run := v_next_run + INTERVAL '1 month';
            END IF;
            
        ELSE
            v_next_run := v_now + INTERVAL '1 day';
    END CASE;
    
    RETURN v_next_run AT TIME ZONE COALESCE(p_timezone, 'UTC');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGERS FOR REAL-TIME UPDATES
-- ============================================

-- Trigger function: Update metrics on new submission
CREATE OR REPLACE FUNCTION on_submission_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for anomalies on each submission
    PERFORM check_submission_anomalies(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Check submission for anomalies
CREATE OR REPLACE FUNCTION check_submission_anomalies(p_submission_id UUID)
RETURNS void AS $$
DECLARE
    v_submission RECORD;
    v_company_id UUID;
    v_thresholds RECORD;
    v_recent_accuracy DECIMAL;
BEGIN
    -- Get submission details
    SELECT s.*, t.created_by as company_id
    INTO v_submission
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    v_company_id := v_submission.company_id;
    
    -- Get thresholds
    SELECT * INTO v_thresholds
    FROM public.anomaly_thresholds
    WHERE company_id = v_company_id;
    
    -- Check quality score if submission was reviewed
    IF v_submission.quality_score IS NOT NULL AND 
       v_submission.quality_score * 100 < COALESCE(v_thresholds.min_accuracy_threshold, 85) THEN
        
        PERFORM create_anomaly_alert(
            v_company_id,
            'quality_anomaly',
            'warning',
            'Low Quality Submission Detected',
            'Submission ' || p_submission_id::TEXT || ' has quality score of ' || 
            ROUND(v_submission.quality_score * 100, 1)::TEXT || '% which is below threshold.',
            v_submission.quality_score * 100,
            COALESCE(v_thresholds.min_accuracy_threshold, 85),
            v_submission.user_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS submission_created_trigger ON public.submissions;
CREATE TRIGGER submission_created_trigger
    AFTER INSERT ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION on_submission_created();

-- ============================================
-- 7. RLS POLICIES
-- ============================================

ALTER TABLE public.anomaly_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_email_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_report_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Anomaly thresholds: Companies can manage their own
CREATE POLICY anomaly_thresholds_policy ON public.anomaly_thresholds
    FOR ALL USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Anomaly alerts: Companies can view/manage their own
CREATE POLICY anomaly_alerts_policy ON public.anomaly_alerts
    FOR ALL USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Scheduled reports: Companies can manage their own
CREATE POLICY scheduled_reports_policy ON public.scheduled_email_reports
    FOR ALL USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Email log: Companies can view their own
CREATE POLICY email_log_policy ON public.email_report_log
    FOR SELECT USING (
        company_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Notification preferences: Users can manage their own
CREATE POLICY notification_prefs_policy ON public.notification_preferences
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anomaly_thresholds TO authenticated;
GRANT SELECT, UPDATE ON public.anomaly_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_email_reports TO authenticated;
GRANT SELECT ON public.email_report_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.v_realtime_submission_stats TO authenticated;
GRANT SELECT ON public.v_realtime_worker_activity TO authenticated;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomaly_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
