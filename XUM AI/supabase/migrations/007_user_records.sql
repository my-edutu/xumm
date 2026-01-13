-- ============================================================================
-- USER RECORDS & ACTIVITY TRACKING
-- Track user activity for daily/weekly/monthly statistics
-- Created: 2026-01-10
-- ============================================================================

-- Activity type enum
CREATE TYPE public.activity_type AS ENUM (
    'voice_recording',
    'image_capture', 
    'video_recording',
    'text_input',
    'translation',
    'judge_review',
    'login',
    'withdrawal_request',
    'task_completed',
    'task_approved',
    'task_rejected'
);

-- ============================================================================
-- USER ACTIVITY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type public.activity_type NOT NULL,
    description VARCHAR(255),
    
    -- Reference (optional link to related record)
    reference_type VARCHAR(50),  -- 'task_submission', 'withdrawal', etc.
    reference_id UUID,
    
    -- Reward earned (if any)
    reward_earned DECIMAL(10, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB,  -- Additional context data
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date 
ON public.user_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_type 
ON public.user_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_user_activities_daily 
ON public.user_activities(user_id, DATE(created_at));

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activities"
ON public.user_activities
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert activities
CREATE POLICY "System can log activities"
ON public.user_activities
FOR INSERT
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all activities"
ON public.user_activities
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- USER DAILY STATS (Aggregated)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User and Date
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    
    -- Activity Counts
    voice_recordings INTEGER DEFAULT 0,
    image_captures INTEGER DEFAULT 0,
    video_recordings INTEGER DEFAULT 0,
    text_inputs INTEGER DEFAULT 0,
    translations INTEGER DEFAULT 0,
    judge_reviews INTEGER DEFAULT 0,
    
    -- Task Stats
    tasks_submitted INTEGER DEFAULT 0,
    tasks_approved INTEGER DEFAULT 0,
    tasks_rejected INTEGER DEFAULT 0,
    
    -- Earnings
    total_earned DECIMAL(10, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, stat_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user 
ON public.user_daily_stats(user_id, stat_date DESC);

-- Enable RLS
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY "Users can view own daily stats"
ON public.user_daily_stats
FOR SELECT
USING (auth.uid() = user_id);

-- System can manage stats
CREATE POLICY "System can manage stats"
ON public.user_daily_stats
FOR ALL
USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type public.activity_type,
    p_description VARCHAR(255) DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reward DECIMAL(10, 2) DEFAULT 0,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    -- Insert activity log
    INSERT INTO public.user_activities (user_id, activity_type, description, reference_type, reference_id, reward_earned, metadata)
    VALUES (p_user_id, p_activity_type, p_description, p_reference_type, p_reference_id, p_reward, p_metadata)
    RETURNING id INTO v_activity_id;
    
    -- Update daily stats
    INSERT INTO public.user_daily_stats (user_id, stat_date, total_earned)
    VALUES (p_user_id, CURRENT_DATE, p_reward)
    ON CONFLICT (user_id, stat_date) DO UPDATE
    SET 
        total_earned = user_daily_stats.total_earned + p_reward,
        updated_at = NOW(),
        voice_recordings = user_daily_stats.voice_recordings + CASE WHEN p_activity_type = 'voice_recording' THEN 1 ELSE 0 END,
        image_captures = user_daily_stats.image_captures + CASE WHEN p_activity_type = 'image_capture' THEN 1 ELSE 0 END,
        video_recordings = user_daily_stats.video_recordings + CASE WHEN p_activity_type = 'video_recording' THEN 1 ELSE 0 END,
        text_inputs = user_daily_stats.text_inputs + CASE WHEN p_activity_type = 'text_input' THEN 1 ELSE 0 END,
        translations = user_daily_stats.translations + CASE WHEN p_activity_type = 'translation' THEN 1 ELSE 0 END,
        judge_reviews = user_daily_stats.judge_reviews + CASE WHEN p_activity_type = 'judge_review' THEN 1 ELSE 0 END,
        tasks_submitted = user_daily_stats.tasks_submitted + CASE WHEN p_activity_type = 'task_completed' THEN 1 ELSE 0 END,
        tasks_approved = user_daily_stats.tasks_approved + CASE WHEN p_activity_type = 'task_approved' THEN 1 ELSE 0 END,
        tasks_rejected = user_daily_stats.tasks_rejected + CASE WHEN p_activity_type = 'task_rejected' THEN 1 ELSE 0 END;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user records with filter
CREATE OR REPLACE FUNCTION get_user_records(
    p_user_id UUID,
    p_filter VARCHAR(10) DEFAULT 'all',  -- 'daily', 'weekly', 'monthly', 'all'
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    activity_type public.activity_type,
    description VARCHAR(255),
    reward_earned DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.activity_type,
        ua.description,
        ua.reward_earned,
        ua.created_at
    FROM public.user_activities ua
    WHERE ua.user_id = p_user_id
    AND (
        CASE 
            WHEN p_filter = 'daily' THEN ua.created_at >= CURRENT_DATE
            WHEN p_filter = 'weekly' THEN ua.created_at >= CURRENT_DATE - INTERVAL '7 days'
            WHEN p_filter = 'monthly' THEN ua.created_at >= CURRENT_DATE - INTERVAL '30 days'
            ELSE TRUE
        END
    )
    ORDER BY ua.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user stats summary
CREATE OR REPLACE FUNCTION get_user_stats_summary(
    p_user_id UUID,
    p_period VARCHAR(10) DEFAULT 'all'  -- 'daily', 'weekly', 'monthly', 'all'
)
RETURNS TABLE (
    total_voice INTEGER,
    total_images INTEGER,
    total_videos INTEGER,
    total_texts INTEGER,
    total_translations INTEGER,
    total_reviews INTEGER,
    total_tasks INTEGER,
    total_approved INTEGER,
    total_earnings DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(uds.voice_recordings), 0)::INTEGER as total_voice,
        COALESCE(SUM(uds.image_captures), 0)::INTEGER as total_images,
        COALESCE(SUM(uds.video_recordings), 0)::INTEGER as total_videos,
        COALESCE(SUM(uds.text_inputs), 0)::INTEGER as total_texts,
        COALESCE(SUM(uds.translations), 0)::INTEGER as total_translations,
        COALESCE(SUM(uds.judge_reviews), 0)::INTEGER as total_reviews,
        COALESCE(SUM(uds.tasks_submitted), 0)::INTEGER as total_tasks,
        COALESCE(SUM(uds.tasks_approved), 0)::INTEGER as total_approved,
        COALESCE(SUM(uds.total_earned), 0) as total_earnings
    FROM public.user_daily_stats uds
    WHERE uds.user_id = p_user_id
    AND (
        CASE 
            WHEN p_period = 'daily' THEN uds.stat_date = CURRENT_DATE
            WHEN p_period = 'weekly' THEN uds.stat_date >= CURRENT_DATE - INTERVAL '7 days'
            WHEN p_period = 'monthly' THEN uds.stat_date >= CURRENT_DATE - INTERVAL '30 days'
            ELSE TRUE
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_activities IS 'Log of all user activities for records tracking';
COMMENT ON TABLE public.user_daily_stats IS 'Aggregated daily statistics per user';
COMMENT ON FUNCTION log_user_activity IS 'Log an activity and update daily stats automatically';
COMMENT ON FUNCTION get_user_records IS 'Get user activity records with daily/weekly/monthly filter';
COMMENT ON FUNCTION get_user_stats_summary IS 'Get summary stats for a user over a period';
