-- XUM AI PRD Features Implementation
-- Version: 1.0 (Advanced Gamification & Skills)

-- 1. Skills & Languages
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT -- 'language', 'technical', 'creative', 'judgment'
);

CREATE TABLE IF NOT EXISTS public.user_skills (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency INTEGER DEFAULT 1, -- 1-5
    verified BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, skill_id)
);

-- 2. Referrals System
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.users(id),
    referred_id UUID REFERENCES public.users(id) UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'successful' (after first task)
    bounty_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Streaks & Challenges
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    required_count INTEGER,
    reward_amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, challenge_id)
);

-- 4. XUM Linguasense (Lexicons)
CREATE TABLE IF NOT EXISTS public.lexicons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code TEXT NOT NULL,
    term TEXT NOT NULL,
    category TEXT, -- 'slang', 'medical', 'legal', 'dialect'
    definitions JSONB, -- { 'en': '...', 'local': '...' }
    examples TEXT[],
    creator_id UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'draft', -- 'draft', 'validated', 'published'
    consensus_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Dataset Exports & Versions
CREATE TABLE IF NOT EXISTS public.dataset_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.project_budgets(id), -- Linked to budgets/projects
    version TEXT NOT NULL,
    format TEXT DEFAULT 'jsonl', -- 'jsonl', 'csv', 'parquet'
    file_url TEXT,
    total_records INTEGER,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.users(id)
);

-- 6. Task Targeting Updates
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS required_skills UUID[];
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_regions TEXT[];
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS min_accuracy_score DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS min_user_level INTEGER DEFAULT 1;

-- 7. Trigger for Streak Calculation
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    user_streak_record RECORD;
BEGIN
    SELECT * INTO user_streak_record FROM public.user_streaks WHERE user_id = NEW.user_id;

    IF NOT FOUND THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES (NEW.user_id, 1, 1, today);
    ELSE
        IF user_streak_record.last_activity_date = today THEN
            -- Already active today, do nothing
            RETURN NEW;
        ELSIF user_streak_record.last_activity_date = today - INTERVAL '1 day' THEN
            -- Consecutive day
            UPDATE public.user_streaks 
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity_date = today,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        ELSE
            -- Streak broken
            UPDATE public.user_streaks 
            SET current_streak = 1,
                last_activity_date = today,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_submission_logged
    AFTER INSERT ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_streak();

-- Default Skills Seed
INSERT INTO public.skills (name, category) VALUES 
('English Proficiency', 'language'),
('French Proficiency', 'language'),
('Spanish Proficiency', 'language'),
('Arabic Proficiency', 'language'),
('Voice Recording', 'technical'),
('Image Labeling', 'technical'),
('Audio Transcription', 'technical'),
('Fact Checking', 'judgment'),
('Toxicity Detection', 'judgment'),
('Translation', 'technical')
ON CONFLICT (name) DO NOTHING;

-- RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lexicons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users read own skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Admins manage everything" ON public.skills FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
