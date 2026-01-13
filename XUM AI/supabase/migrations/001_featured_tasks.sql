-- ============================================================================
-- FEATURED TASKS TABLE
-- Admin-controlled featured/promo cards shown on the home screen
-- Created: 2026-01-10
-- ============================================================================

-- Create featured_tasks table
CREATE TABLE IF NOT EXISTS public.featured_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Display Properties
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    badge_text VARCHAR(50) NOT NULL,
    
    -- Styling
    gradient_start VARCHAR(7) NOT NULL DEFAULT '#10b981',  -- Hex color
    gradient_end VARCHAR(7) NOT NULL DEFAULT '#059669',    -- Hex color
    icon_name VARCHAR(50) NOT NULL DEFAULT 'camera-alt',   -- MaterialIcons name
    
    -- Navigation
    target_screen VARCHAR(50) NOT NULL,  -- Screen name to navigate to
    
    -- Ordering and Status
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Admin who created/modified
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create index for ordering and active status
CREATE INDEX IF NOT EXISTS idx_featured_tasks_active_order 
ON public.featured_tasks(is_active, display_order);

-- Enable RLS
ALTER TABLE public.featured_tasks ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view active featured tasks)
CREATE POLICY "Anyone can view active featured tasks"
ON public.featured_tasks
FOR SELECT
USING (is_active = true);

-- Admin write policy (only admins can insert/update/delete)
CREATE POLICY "Admins can manage featured tasks"
ON public.featured_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_featured_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_featured_tasks_updated_at
    BEFORE UPDATE ON public.featured_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_featured_tasks_updated_at();

-- Insert default featured tasks
INSERT INTO public.featured_tasks (title, subtitle, badge_text, gradient_start, gradient_end, icon_name, target_screen, display_order)
VALUES 
    ('Capture & Get Paid', 'Use your camera & mic to train AI.', 'EARN REWARDS', '#10b981', '#059669', 'camera-alt', 'ENVIRONMENTAL_SENSING', 1),
    ('Train Language AI', 'Help AI understand your language.', 'XUM LINGUASENSE', '#8b5cf6', '#6366f1', 'translate', 'LINGUASENSE_ENGINE', 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.featured_tasks IS 'Admin-controlled featured task cards displayed on the home screen';
COMMENT ON COLUMN public.featured_tasks.title IS 'Main title displayed on the card';
COMMENT ON COLUMN public.featured_tasks.subtitle IS 'Short description below the title';
COMMENT ON COLUMN public.featured_tasks.badge_text IS 'Small badge text shown at top of card (e.g., EARN REWARDS)';
COMMENT ON COLUMN public.featured_tasks.gradient_start IS 'Start color for card gradient background (hex)';
COMMENT ON COLUMN public.featured_tasks.gradient_end IS 'End color for card gradient background (hex)';
COMMENT ON COLUMN public.featured_tasks.icon_name IS 'MaterialIcons icon name for the card';
COMMENT ON COLUMN public.featured_tasks.target_screen IS 'Screen name to navigate to when tapped';
COMMENT ON COLUMN public.featured_tasks.display_order IS 'Order in which cards appear (lower = first)';
COMMENT ON COLUMN public.featured_tasks.is_active IS 'Whether the card is currently visible';
