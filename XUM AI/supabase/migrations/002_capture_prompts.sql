-- ============================================================================
-- CAPTURE TASK PROMPTS TABLE  
-- Admin-controlled prompts for voice, image, and video capture tasks
-- Created: 2026-01-10
-- ============================================================================

-- Create task types enum
CREATE TYPE public.capture_task_type AS ENUM ('voice', 'image', 'video');

-- Create capture_prompts table
CREATE TABLE IF NOT EXISTS public.capture_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Task Type
    task_type public.capture_task_type NOT NULL,
    
    -- Prompt Content
    prompt_text VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,  -- e.g., 'Greeting', 'Color', 'Gesture'
    hint_text VARCHAR(255),         -- Helper text shown below prompt
    
    -- Rewards
    base_reward DECIMAL(10, 2) NOT NULL DEFAULT 0.25,
    bonus_reward DECIMAL(10, 2) NOT NULL DEFAULT 0.05,  -- For translation/description
    
    -- Targeting (optional - for future use)
    language_code VARCHAR(10),      -- e.g., 'en', 'es', 'yo' for specific languages
    region_code VARCHAR(10),        -- e.g., 'NG', 'US' for specific regions
    
    -- Status and Ordering
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Admin tracking
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_capture_prompts_type_active 
ON public.capture_prompts(task_type, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_capture_prompts_language 
ON public.capture_prompts(language_code) WHERE language_code IS NOT NULL;

-- Enable RLS
ALTER TABLE public.capture_prompts ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can view active prompts"
ON public.capture_prompts
FOR SELECT
USING (is_active = true);

-- Admin write policy
CREATE POLICY "Admins can manage prompts"
ON public.capture_prompts
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Update trigger
CREATE TRIGGER trigger_capture_prompts_updated_at
    BEFORE UPDATE ON public.capture_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_featured_tasks_updated_at();

-- ============================================================================
-- INSERT DEFAULT VOICE PROMPTS
-- ============================================================================

INSERT INTO public.capture_prompts (task_type, prompt_text, category, hint_text, base_reward, display_order)
VALUES 
    ('voice', 'Say: ''Hello, how are you today?''', 'Greeting', 'Speak clearly into your microphone', 0.25, 1),
    ('voice', 'Sing the first line of a popular song', 'Music', 'Any song you know well', 0.25, 2),
    ('voice', 'Tell a short story about your day', 'Narrative', 'Keep it under 30 seconds', 0.25, 3),
    ('voice', 'Read aloud: ''The quick brown fox jumps over the lazy dog''', 'Reading', 'Speak naturally', 0.25, 4),
    ('voice', 'Describe what you see outside your window', 'Description', 'Be detailed and specific', 0.25, 5),
    ('voice', 'Count from 1 to 10 in your native language', 'Numbers', 'Speak clearly', 0.25, 6),
    ('voice', 'Say your favorite food and why you like it', 'Opinion', 'Express yourself naturally', 0.25, 7),
    ('voice', 'Recite a poem you know by heart', 'Poetry', 'Any poem or rhyme', 0.25, 8),
    ('voice', 'Give directions to a nearby place', 'Navigation', 'Be specific with landmarks', 0.25, 9),
    ('voice', 'Express excitement about good news', 'Emotion', 'Show genuine emotion', 0.25, 10),
    ('voice', 'Order food at a restaurant', 'Role-play', 'Pretend you are ordering', 0.25, 11),
    ('voice', 'Describe the weather today', 'Description', 'Be specific about conditions', 0.25, 12),
    ('voice', 'Tell a joke you know', 'Humor', 'Keep it appropriate', 0.25, 13),
    ('voice', 'Say goodbye to a friend', 'Greeting', 'Natural farewell', 0.25, 14),
    ('voice', 'Introduce yourself to someone new', 'Introduction', 'Name, background, interests', 0.25, 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT IMAGE PROMPTS
-- ============================================================================

INSERT INTO public.capture_prompts (task_type, prompt_text, category, hint_text, base_reward, display_order)
VALUES 
    ('image', 'Take a photo of something green', 'Color', 'Make sure the subject is clearly visible', 0.30, 1),
    ('image', 'Capture a street sign near you', 'Signs', 'Text should be readable', 0.30, 2),
    ('image', 'Photo of your favorite item at home', 'Objects', 'Good lighting preferred', 0.30, 3),
    ('image', 'Take a picture of food or drink', 'Food', 'Close-up works best', 0.30, 4),
    ('image', 'Capture a vehicle (car, bike, etc.)', 'Transport', 'Full vehicle in frame', 0.30, 5),
    ('image', 'Photo of an electronic device', 'Tech', 'Phone, laptop, TV, etc.', 0.30, 6),
    ('image', 'Take a picture of nature (plant, tree, sky)', 'Nature', 'Outdoor subjects', 0.30, 7),
    ('image', 'Capture a piece of furniture', 'Home', 'Chair, table, bed, etc.', 0.30, 8),
    ('image', 'Photo of clothing or fabric', 'Fashion', 'Show texture and color', 0.30, 9),
    ('image', 'Take a picture of an animal or pet', 'Animals', 'Keep them in focus', 0.30, 10),
    ('image', 'Capture a building or structure', 'Architecture', 'Exterior or interior', 0.30, 11),
    ('image', 'Photo of text on a product', 'Text', 'Labels, packaging, etc.', 0.30, 12),
    ('image', 'Take a picture of a door or entrance', 'Objects', 'Any type of door', 0.30, 13),
    ('image', 'Capture something round or circular', 'Shapes', 'Balls, plates, wheels, etc.', 0.30, 14),
    ('image', 'Photo of your workspace or desk', 'Home', 'Show your setup', 0.30, 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT VIDEO PROMPTS
-- ============================================================================

INSERT INTO public.capture_prompts (task_type, prompt_text, category, hint_text, base_reward, display_order)
VALUES 
    ('video', 'Record yourself waving hello', 'Gesture', 'Record 5-15 seconds of video', 0.50, 1),
    ('video', 'Film a 360° view of your room', 'Environment', 'Slow, steady rotation', 0.50, 2),
    ('video', 'Record opening and closing a door', 'Action', 'Full action in frame', 0.50, 3),
    ('video', 'Film water pouring into a glass', 'Action', 'Good lighting needed', 0.50, 4),
    ('video', 'Record a pet or animal moving', 'Animals', 'Capture their movement', 0.50, 5),
    ('video', 'Film traffic or vehicles passing by', 'Transport', 'Safe location only', 0.50, 6),
    ('video', 'Record yourself writing something', 'Action', 'Show the pen and paper', 0.50, 7),
    ('video', 'Film leaves or trees moving in wind', 'Nature', 'Capture the motion', 0.50, 8),
    ('video', 'Record turning lights on and off', 'Action', 'Show the light change', 0.50, 9),
    ('video', 'Film yourself cooking or preparing food', 'Activity', 'Any food preparation', 0.50, 10),
    ('video', 'Record walking down a hallway', 'Movement', 'Steady footage', 0.50, 11),
    ('video', 'Film raindrops or water droplets', 'Nature', 'Close-up if possible', 0.50, 12),
    ('video', 'Record picking up and putting down an object', 'Action', 'Any small object', 0.50, 13),
    ('video', 'Film a clock or watch ticking', 'Objects', 'Capture the movement', 0.50, 14),
    ('video', 'Record your hands typing on keyboard', 'Action', 'Show the typing action', 0.50, 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.capture_prompts IS 'Admin-controlled prompts for voice, image, and video capture tasks';
COMMENT ON COLUMN public.capture_prompts.task_type IS 'Type of capture task: voice, image, or video';
COMMENT ON COLUMN public.capture_prompts.prompt_text IS 'The instruction shown to users';
COMMENT ON COLUMN public.capture_prompts.category IS 'Category badge shown on the prompt card';
COMMENT ON COLUMN public.capture_prompts.hint_text IS 'Helper text shown below the main prompt';
COMMENT ON COLUMN public.capture_prompts.base_reward IS 'Base reward for completing this task';
COMMENT ON COLUMN public.capture_prompts.bonus_reward IS 'Bonus for adding translation/description';
COMMENT ON COLUMN public.capture_prompts.language_code IS 'Optional: target specific language users';
COMMENT ON COLUMN public.capture_prompts.region_code IS 'Optional: target specific region users';
