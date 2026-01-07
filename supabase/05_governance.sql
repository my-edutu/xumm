-- Platform Governance & Feature Flags
-- Version: 1.1 (Added for Platform Sync)

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES public.users(id)
);

-- Default Settings
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('maintenance_mode', 'false', 'Disable all user task submissions'),
    ('min_withdrawal_amount', '5.00', 'Minimum USD for withdrawal requests'),
    ('task_types_enabled', '["audio", "image", "text", "validation", "linguasense", "rlhf"]', 'Allowed mission protocols'),
    ('global_announcement', '{"text": "", "active": false}', 'Banner message for all users')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings" 
    ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify platform settings" 
    ON public.platform_settings FOR ALL 
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
