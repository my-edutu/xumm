-- ============================================================================
-- USER TASK SUBMISSIONS TABLE
-- Tracks user completions of capture tasks for rewards
-- Created: 2026-01-10
-- ============================================================================

-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'reviewing');

-- Create task_submissions table
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User and Task Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.capture_prompts(id),
    task_type public.capture_task_type NOT NULL,
    
    -- Submission Data
    file_url TEXT,                    -- Storage URL for media file
    file_size_bytes INTEGER,
    duration_seconds DECIMAL(10, 2),  -- For audio/video
    
    -- Translation/Description (bonus content)
    translation_text TEXT,
    translation_language VARCHAR(10),
    
    -- Review Status
    status public.submission_status NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Reward Tracking
    base_reward DECIMAL(10, 2) NOT NULL,
    bonus_reward DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_reward DECIMAL(10, 2) GENERATED ALWAYS AS (base_reward + bonus_reward) STORED,
    reward_paid BOOLEAN NOT NULL DEFAULT false,
    reward_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Session Tracking (for 5-task batches)
    session_id UUID,  -- Groups submissions in same earning session
    session_position INTEGER,  -- 1-5 position in session
    
    -- Metadata
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_user 
ON public.task_submissions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_submissions_status 
ON public.task_submissions(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_task_submissions_session 
ON public.task_submissions(session_id);

CREATE INDEX IF NOT EXISTS idx_task_submissions_prompt 
ON public.task_submissions(prompt_id);

-- Enable RLS
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.task_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can create submissions"
ON public.task_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.task_submissions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update submissions (for review)
CREATE POLICY "Admins can update submissions"
ON public.task_submissions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Update trigger
CREATE TRIGGER trigger_task_submissions_updated_at
    BEFORE UPDATE ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_featured_tasks_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get random prompts for a task type
CREATE OR REPLACE FUNCTION get_random_prompts(
    p_task_type public.capture_task_type,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS SETOF public.capture_prompts AS $$
BEGIN
    -- Return prompts user hasn't completed recently, randomized
    RETURN QUERY
    SELECT cp.*
    FROM public.capture_prompts cp
    WHERE cp.task_type = p_task_type
    AND cp.is_active = true
    AND cp.id NOT IN (
        -- Exclude prompts completed in last 24 hours
        SELECT ts.prompt_id 
        FROM public.task_submissions ts
        WHERE ts.user_id = p_user_id
        AND ts.created_at > NOW() - INTERVAL '24 hours'
    )
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user earnings
CREATE OR REPLACE FUNCTION get_user_earnings(p_user_id UUID)
RETURNS TABLE (
    total_earned DECIMAL(10, 2),
    pending_reward DECIMAL(10, 2),
    paid_reward DECIMAL(10, 2),
    total_submissions INTEGER,
    approved_submissions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ts.total_reward), 0) as total_earned,
        COALESCE(SUM(CASE WHEN ts.status = 'approved' AND NOT ts.reward_paid THEN ts.total_reward ELSE 0 END), 0) as pending_reward,
        COALESCE(SUM(CASE WHEN ts.reward_paid THEN ts.total_reward ELSE 0 END), 0) as paid_reward,
        COUNT(*)::INTEGER as total_submissions,
        COUNT(*) FILTER (WHERE ts.status = 'approved')::INTEGER as approved_submissions
    FROM public.task_submissions ts
    WHERE ts.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.task_submissions IS 'Tracks all user submissions for capture tasks';
COMMENT ON COLUMN public.task_submissions.session_id IS 'Groups 5 submissions in a single earning session';
COMMENT ON COLUMN public.task_submissions.session_position IS 'Position 1-5 within earning session';
COMMENT ON COLUMN public.task_submissions.total_reward IS 'Auto-calculated: base_reward + bonus_reward';
