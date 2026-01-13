-- ============================================================================
-- 011: UNIFIED GAMIFICATION ENGINE
-- Tracks milestones from the 'submissions' table
-- ============================================================================

-- 1. Create badges master catalog
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    category VARCHAR(50) DEFAULT 'general',
    requirement_type VARCHAR(50), 
    requirement_value INTEGER,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 3. Create achievement_progress
CREATE TABLE IF NOT EXISTS public.achievement_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stat_name VARCHAR(100) NOT NULL, 
    current_value DECIMAL(12, 2) DEFAULT 0,
    target_value DECIMAL(12, 2) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stat_name)
);

-- 4. Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- 5. Logic: Auto-track achievement stats on submission
CREATE OR REPLACE FUNCTION public.track_submission_gamification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Link user progress
        INSERT INTO public.achievement_progress (user_id, stat_name, current_value, target_value)
        VALUES (NEW.user_id, 'approved_submissions', 1, 10)
        ON CONFLICT (user_id, stat_name) DO UPDATE
        SET current_value = achievement_progress.current_value + 1,
            last_updated = NOW();
            
        -- specific task type progress (assumes 'tasks' has 'task_type')
        -- Logic to award badges can be expanded here
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_gamification_progress ON public.submissions;
CREATE TRIGGER tr_gamification_progress
    AFTER UPDATE OF status ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.track_submission_gamification();

-- 6. Seed Initial Badges
INSERT INTO public.badges (name, description, category, requirement_type, requirement_value)
VALUES 
    ('Pioneer', 'Complete your first approved task.', 'general', 'count', 1),
    ('Quality Master', '10 approved submissions in a row.', 'quality', 'streak', 10)
ON CONFLICT DO NOTHING;
