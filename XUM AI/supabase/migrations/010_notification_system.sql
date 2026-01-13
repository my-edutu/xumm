-- ============================================================================
-- 010: UNIFIED NOTIFICATION SYSTEM SYNC
-- Bridges Admin/Company portal actions with User notifications
-- Target Tables: public.submissions, public.withdrawals, public.notifications
-- ============================================================================

-- 1. Ensure notification 'data' or metadata exists for deep linking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE public.notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Trigger: Notify user when SUBMISSION changes status
CREATE OR REPLACE FUNCTION public.notify_submission_event()
RETURNS TRIGGER AS $$
DECLARE
    v_title TEXT;
    v_msg TEXT;
    v_task_title TEXT;
BEGIN
    -- Get task title
    SELECT title INTO v_task_title FROM public.tasks WHERE id = NEW.task_id;

    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        v_title := '✅ Task Approved!';
        v_msg := 'Your work on "' || v_task_title || '" was accepted. Reward added to wallet.';
        
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (NEW.user_id, 'task_update', v_title, v_msg, jsonb_build_object('submission_id', NEW.id, 'status', 'approved'));
    
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        v_title := '❌ Task Rejected';
        v_msg := 'Your submission for "' || v_task_title || '" was not accepted. Reason: ' || COALESCE(NEW.rejection_reason, 'Quality check failed');
        
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (NEW.user_id, 'task_update', v_title, v_msg, jsonb_build_object('submission_id', NEW.id, 'status', 'rejected'));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_submission_event ON public.submissions;
CREATE TRIGGER tr_notify_submission_event
    AFTER UPDATE OF status ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_submission_event();

-- 3. Trigger: Notify user when WITHDRAWAL changes status
CREATE OR REPLACE FUNCTION public.notify_withdrawal_event()
RETURNS TRIGGER AS $$
DECLARE
    v_title TEXT := '💰 Payment Update';
    v_msg TEXT;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        v_msg := 'Your withdrawal of $' || NEW.amount || ' has been paid out successfully.';
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (NEW.user_id, 'payment_alert', v_title, v_msg, jsonb_build_object('withdrawal_id', NEW.id, 'status', 'completed'));
        
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        v_msg := 'Your withdrawal request for $' || NEW.amount || ' was rejected.';
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (NEW.user_id, 'payment_alert', v_title, v_msg, jsonb_build_object('withdrawal_id', NEW.id, 'status', 'rejected'));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_withdrawal_event ON public.withdrawals;
CREATE TRIGGER tr_notify_withdrawal_event
    AFTER UPDATE OF status ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_withdrawal_event();

-- RLS Update (Ensure users can see their own notifications)
-- The table already exists, so we just confirm policies or add them if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users view own alerts') THEN
        CREATE POLICY "Users view own alerts" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;
