-- ============================================================================
-- DAILY MISSIONS & XUM JUDGE TASKS
-- Admin-controlled tasks that appear on user home screen
-- Created: 2026-01-10
-- ============================================================================

-- Task category enum
CREATE TYPE public.task_category AS ENUM ('daily_mission', 'xum_judge');

-- Create admin_tasks table
CREATE TABLE IF NOT EXISTS public.admin_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Task Category
    category public.task_category NOT NULL,
    
    -- Display Properties
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'assignment',
    icon_color VARCHAR(7) NOT NULL DEFAULT '#14b8a6',  -- Fixed minimal color
    
    -- Reward
    reward DECIMAL(10, 2) NOT NULL DEFAULT 0.50,
    estimated_time VARCHAR(20),  -- e.g., "5 min", "10-15 min"
    
    -- Navigation
    target_screen VARCHAR(50) NOT NULL,  -- Screen to open when clicked
    
    -- Access Control
    min_user_level INTEGER DEFAULT 0,     -- 0 = all users, higher = experienced users
    is_locked_for_new_users BOOLEAN DEFAULT false,  -- XUM Judge locked by default
    unlock_after_tasks INTEGER DEFAULT 0,  -- Unlock after completing X tasks
    
    -- Status and Ordering
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Scheduling (optional)
    start_date DATE,
    end_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_tasks_category 
ON public.admin_tasks(category, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_admin_tasks_dates 
ON public.admin_tasks(start_date, end_date) 
WHERE start_date IS NOT NULL OR end_date IS NOT NULL;

-- Enable RLS
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view active tasks they have access to
CREATE POLICY "Users can view accessible tasks"
ON public.admin_tasks
FOR SELECT
USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage tasks"
ON public.admin_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Update trigger
CREATE TRIGGER trigger_admin_tasks_updated_at
    BEFORE UPDATE ON public.admin_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_featured_tasks_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get daily missions for user
CREATE OR REPLACE FUNCTION get_daily_missions(p_user_id UUID)
RETURNS SETOF public.admin_tasks AS $$
DECLARE
    v_completed_tasks INTEGER;
BEGIN
    -- Get user's completed task count
    SELECT COUNT(*) INTO v_completed_tasks
    FROM public.task_submissions
    WHERE user_id = p_user_id AND status = 'approved';
    
    RETURN QUERY
    SELECT *
    FROM public.admin_tasks t
    WHERE t.category = 'daily_mission'
    AND t.is_active = true
    AND (t.start_date IS NULL OR t.start_date <= CURRENT_DATE)
    AND (t.end_date IS NULL OR t.end_date >= CURRENT_DATE)
    ORDER BY t.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get XUM Judge tasks for user (with lock check)
CREATE OR REPLACE FUNCTION get_xum_judge_tasks(p_user_id UUID)
RETURNS TABLE (
    task_data public.admin_tasks,
    is_unlocked BOOLEAN
) AS $$
DECLARE
    v_completed_tasks INTEGER;
BEGIN
    -- Get user's completed task count
    SELECT COUNT(*) INTO v_completed_tasks
    FROM public.task_submissions
    WHERE user_id = p_user_id AND status = 'approved';
    
    RETURN QUERY
    SELECT 
        t.*,
        (NOT t.is_locked_for_new_users OR v_completed_tasks >= t.unlock_after_tasks) as is_unlocked
    FROM public.admin_tasks t
    WHERE t.category = 'xum_judge'
    AND t.is_active = true
    AND (t.start_date IS NULL OR t.start_date <= CURRENT_DATE)
    AND (t.end_date IS NULL OR t.end_date >= CURRENT_DATE)
    ORDER BY t.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSERT DEFAULT DAILY MISSIONS
-- ============================================================================

INSERT INTO public.admin_tasks (category, title, subtitle, icon_name, icon_color, reward, estimated_time, target_screen, display_order)
VALUES 
    ('daily_mission', 'Record Voice Sample', 'Help train speech recognition', 'mic', '#14b8a6', 0.25, '2 min', 'VOICE_TASK', 1),
    ('daily_mission', 'Capture 5 Photos', 'Label objects in your environment', 'camera-alt', '#14b8a6', 1.50, '5 min', 'IMAGE_TASK', 2),
    ('daily_mission', 'Record Short Video', 'Capture motion data', 'videocam', '#14b8a6', 0.50, '3 min', 'VIDEO_TASK', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT XUM JUDGE TASKS (Locked for new users)
-- ============================================================================

INSERT INTO public.admin_tasks (category, title, subtitle, description, icon_name, icon_color, reward, estimated_time, target_screen, is_locked_for_new_users, unlock_after_tasks, display_order)
VALUES 
    ('xum_judge', 'Review AI Responses', 'Rate quality of AI answers', 'Rate the quality and accuracy of AI-generated responses in different categories.', 'rate-review', '#8b5cf6', 0.75, '5 min', 'XUM_JUDGE', true, 10, 1),
    ('xum_judge', 'Compare Translations', 'Judge translation accuracy', 'Compare multiple translations and select the most accurate one.', 'compare-arrows', '#8b5cf6', 1.00, '8 min', 'XUM_JUDGE', true, 10, 2),
    ('xum_judge', 'Verify Data Labels', 'Check labeling accuracy', 'Review and correct labels applied to images and audio by other users.', 'fact-check', '#8b5cf6', 0.50, '3 min', 'XUM_JUDGE', true, 5, 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.admin_tasks IS 'Admin-controlled tasks for Daily Missions and XUM Judge sections';
COMMENT ON COLUMN public.admin_tasks.is_locked_for_new_users IS 'If true, task is locked until user completes unlock_after_tasks';
COMMENT ON COLUMN public.admin_tasks.unlock_after_tasks IS 'Number of approved tasks needed to unlock this task';
COMMENT ON FUNCTION get_daily_missions IS 'Get active daily missions for display on home screen';
COMMENT ON FUNCTION get_xum_judge_tasks IS 'Get XUM Judge tasks with unlock status for each user';
