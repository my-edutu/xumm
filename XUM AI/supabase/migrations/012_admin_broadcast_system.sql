-- ============================================================================
-- 012: ADMIN BROADCAST & EMAIL OUTBOX SYSTEM
-- Allows admins to send platform-wide or targeted alerts and emails
-- ============================================================================

-- 1. EMAIL OUTBOX TABLE
-- This table acts as a queue. An Edge Function or the Admin Backend 
-- can listen to insertions here to trigger actual Resend/SMTP sends.
CREATE TABLE IF NOT EXISTS public.mail_outbox (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    
    -- Status tracking
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 2. ADMIN FUNCTION: SEND DIRECT NOTIFICATION
-- Usage: SELECT send_admin_notification(user_uuid, 'Title', 'Message', '{"link": "/wallet"}');
CREATE OR REPLACE FUNCTION public.send_admin_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'system_announcement',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_notif_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    VALUES (p_user_id, p_title, p_message, p_type, p_metadata)
    RETURNING id INTO v_notif_id;
    
    RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ADMIN FUNCTION: QUEUE EMAIL
-- Usage: SELECT queue_admin_email('user@example.com', 'XUM Update', '<h1>Hello</h1>', user_uuid);
CREATE OR REPLACE FUNCTION public.queue_admin_email(
    p_email TEXT,
    p_subject TEXT,
    p_body TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_mail_id UUID;
BEGIN
    INSERT INTO public.mail_outbox (recipient_email, subject, body_html, user_id)
    VALUES (p_email, p_subject, p_body, p_user_id)
    RETURNING id INTO v_mail_id;
    
    RETURN v_mail_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. MASTER BROADCAST FUNCTION (Both In-App and Email)
-- Usage: SELECT admin_broadcast_to_user(user_uuid, 'Alert', 'Content', true, true);
CREATE OR REPLACE FUNCTION public.admin_broadcast_to_user(
    p_user_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_send_in_app BOOLEAN DEFAULT true,
    p_send_email BOOLEAN DEFAULT false
)
RETURNS TABLE (notification_id UUID, email_id UUID) AS $$
DECLARE
    v_notif_id UUID := NULL;
    v_mail_id UUID := NULL;
    v_email TEXT;
BEGIN
    -- Get user email if needed
    IF p_send_email THEN
        SELECT email INTO v_email FROM public.users WHERE id = p_user_id;
    END IF;

    -- Send In-App
    IF p_send_in_app THEN
        v_notif_id := public.send_admin_notification(p_user_id, p_title, p_content);
    END IF;

    -- Queue Email
    IF p_send_email AND v_email IS NOT NULL THEN
        v_mail_id := public.queue_admin_email(v_email, p_title, '<p>' || p_content || '</p>', p_user_id);
    END IF;

    RETURN QUERY SELECT v_notif_id, v_mail_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES for Mail Outbox
ALTER TABLE public.mail_outbox ENABLE ROW LEVEL SECURITY;

-- Admins can see everything
CREATE POLICY "Admins can manage mail outbox" 
ON public.mail_outbox FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users can see their own (intended) emails for audit logs if needed
CREATE POLICY "Users can view their own mail log"
ON public.mail_outbox FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_mail_outbox_status ON public.mail_outbox(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- COMMENTS
COMMENT ON TABLE public.mail_outbox IS 'Queue for emails to be processed by an external worker or edge function';
COMMENT ON FUNCTION public.admin_broadcast_to_user IS 'Unified function to message a user across multiple channels';
