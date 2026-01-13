-- ============================================================================
-- STORAGE BUCKETS & ADDITIONAL TASK FUNCTIONS
-- Sets up Supabase Storage buckets and enhances task submission functions
-- Created: 2026-01-10
-- ============================================================================

-- ============================================================================
-- NOTE: Storage bucket creation must be done via Supabase Dashboard or CLI
-- Run this in the Supabase Dashboard SQL Editor:
-- ============================================================================

-- The following buckets need to be created manually in Supabase Dashboard:
-- 1. voice-recordings (Public: No, File size limit: 10MB)
-- 2. image-captures (Public: No, File size limit: 5MB)  
-- 3. video-recordings (Public: No, File size limit: 50MB)

-- ============================================================================
-- STORAGE POLICIES (Run after creating buckets)
-- ============================================================================

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to their folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id IN ('voice-recordings', 'image-captures', 'video-recordings')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id IN ('voice-recordings', 'image-captures', 'video-recordings')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all files
CREATE POLICY "Admins can view all files" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id IN ('voice-recordings', 'image-captures', 'video-recordings')
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- ENHANCED TASK SUBMISSION TABLE UPDATES
-- ============================================================================

-- Add metadata column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'task_submissions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.task_submissions ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Add file_size column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'task_submissions' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE public.task_submissions ADD COLUMN file_size INTEGER;
    END IF;
END $$;

-- ============================================================================
-- TASK COMPLETION TRIGGER
-- Automatically log activity when task status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When task is approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Log approval activity
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            description,
            reference_type,
            reference_id,
            reward_earned
        ) VALUES (
            NEW.user_id,
            'task_approved',
            'Task approved: ' || NEW.task_type,
            'task_submission',
            NEW.id,
            NEW.total_reward
        );
        
        -- Update daily stats
        INSERT INTO public.user_daily_stats (user_id, stat_date, tasks_approved, total_earned)
        VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.total_reward)
        ON CONFLICT (user_id, stat_date) DO UPDATE
        SET 
            tasks_approved = user_daily_stats.tasks_approved + 1,
            total_earned = user_daily_stats.total_earned + NEW.total_reward,
            updated_at = NOW();
    END IF;
    
    -- When task is rejected
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            description,
            reference_type,
            reference_id,
            reward_earned
        ) VALUES (
            NEW.user_id,
            'task_rejected',
            'Task rejected: ' || NEW.task_type || COALESCE(' - ' || NEW.rejection_reason, ''),
            'task_submission',
            NEW.id,
            0
        );
        
        -- Update daily stats
        INSERT INTO public.user_daily_stats (user_id, stat_date, tasks_rejected)
        VALUES (NEW.user_id, CURRENT_DATE, 1)
        ON CONFLICT (user_id, stat_date) DO UPDATE
        SET 
            tasks_rejected = user_daily_stats.tasks_rejected + 1,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS task_status_change_trigger ON public.task_submissions;
CREATE TRIGGER task_status_change_trigger
    AFTER UPDATE OF status ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION handle_task_status_change();

-- ============================================================================
-- GET RANDOM PROMPTS FUNCTION (Enhanced)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_random_prompts(
    p_task_type VARCHAR(20),
    p_user_id UUID,
    p_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    task_type VARCHAR(20),
    prompt_text TEXT,
    category VARCHAR(50),
    hint_text TEXT,
    base_reward DECIMAL(10, 2),
    bonus_reward DECIMAL(10, 2),
    language_code VARCHAR(10),
    difficulty_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.task_type::VARCHAR(20),
        cp.prompt_text,
        cp.category,
        cp.hint_text,
        cp.base_reward,
        cp.bonus_reward,
        cp.language_code,
        cp.difficulty_level
    FROM public.capture_prompts cp
    WHERE cp.task_type = p_task_type::capture_task_type
    AND cp.is_active = true
    AND cp.id NOT IN (
        -- Exclude prompts user has already completed
        SELECT ts.prompt_id 
        FROM public.task_submissions ts
        WHERE ts.user_id = p_user_id
        AND ts.status IN ('approved', 'pending', 'reviewing')
    )
    ORDER BY RANDOM()
    LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET USER EARNINGS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_earnings(p_user_id UUID)
RETURNS TABLE (
    total_submissions INTEGER,
    pending_submissions INTEGER,
    approved_submissions INTEGER,
    rejected_submissions INTEGER,
    total_earned DECIMAL(10, 2),
    pending_amount DECIMAL(10, 2),
    voice_count INTEGER,
    image_count INTEGER,
    video_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_submissions,
        COUNT(*) FILTER (WHERE ts.status = 'pending')::INTEGER as pending_submissions,
        COUNT(*) FILTER (WHERE ts.status = 'approved')::INTEGER as approved_submissions,
        COUNT(*) FILTER (WHERE ts.status = 'rejected')::INTEGER as rejected_submissions,
        COALESCE(SUM(ts.total_reward) FILTER (WHERE ts.status = 'approved'), 0) as total_earned,
        COALESCE(SUM(ts.total_reward) FILTER (WHERE ts.status = 'pending'), 0) as pending_amount,
        COUNT(*) FILTER (WHERE ts.task_type = 'voice')::INTEGER as voice_count,
        COUNT(*) FILTER (WHERE ts.task_type = 'image')::INTEGER as image_count,
        COUNT(*) FILTER (WHERE ts.task_type = 'video')::INTEGER as video_count
    FROM public.task_submissions ts
    WHERE ts.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETE TASK SESSION FUNCTION
-- Called when user completes a batch of 5 tasks
-- ============================================================================

CREATE OR REPLACE FUNCTION complete_task_session(
    p_session_id VARCHAR(100),
    p_user_id UUID
)
RETURNS TABLE (
    session_id VARCHAR(100),
    task_count INTEGER,
    total_base_reward DECIMAL(10, 2),
    total_bonus_reward DECIMAL(10, 2),
    total_reward DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.session_id,
        COUNT(*)::INTEGER as task_count,
        COALESCE(SUM(ts.base_reward), 0) as total_base_reward,
        COALESCE(SUM(ts.bonus_reward), 0) as total_bonus_reward,
        COALESCE(SUM(ts.total_reward), 0) as total_reward
    FROM public.task_submissions ts
    WHERE ts.session_id = p_session_id
    AND ts.user_id = p_user_id
    GROUP BY ts.session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADMIN TASK REVIEW VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_task_review AS
SELECT 
    ts.id,
    ts.user_id,
    p.email as user_email,
    p.full_name as user_name,
    ts.task_type,
    ts.prompt_id,
    cp.prompt_text,
    ts.file_url,
    ts.translation_text,
    ts.description,
    ts.status,
    ts.total_reward,
    ts.created_at,
    ts.reviewed_by,
    ts.reviewed_at,
    ts.rejection_reason
FROM public.task_submissions ts
LEFT JOIN public.profiles p ON ts.user_id = p.id
LEFT JOIN public.capture_prompts cp ON ts.prompt_id = cp.id
ORDER BY 
    CASE ts.status 
        WHEN 'pending' THEN 1 
        WHEN 'reviewing' THEN 2 
        ELSE 3 
    END,
    ts.created_at DESC;

-- ============================================================================
-- ADMIN APPROVE/REJECT FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_approve_task(
    p_task_id UUID,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verify admin role
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Update task status
    UPDATE public.task_submissions
    SET 
        status = 'approved',
        reviewed_by = p_admin_id,
        reviewed_at = NOW()
    WHERE id = p_task_id
    AND status IN ('pending', 'reviewing');
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_task(
    p_task_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verify admin role
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Update task status
    UPDATE public.task_submissions
    SET 
        status = 'rejected',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        rejection_reason = p_reason
    WHERE id = p_task_id
    AND status IN ('pending', 'reviewing');
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_random_prompts IS 'Get random prompts excluding ones user has completed';
COMMENT ON FUNCTION get_user_earnings IS 'Get user task statistics and earnings';
COMMENT ON FUNCTION complete_task_session IS 'Get session summary after completing batch';
COMMENT ON FUNCTION admin_approve_task IS 'Admin function to approve a pending task';
COMMENT ON FUNCTION admin_reject_task IS 'Admin function to reject a task with reason';
COMMENT ON VIEW admin_task_review IS 'Admin view for reviewing pending task submissions';
