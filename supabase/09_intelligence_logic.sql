-- Accuracy & Validation Intelligence
-- Version: 1.0

-- 1. Gold Standard (Hidden checks for quality)
CREATE TABLE IF NOT EXISTS public.gold_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id),
    correct_response JSONB NOT NULL,
    explanation TEXT
);

-- 2. Scored Submissions
CREATE TABLE IF NOT EXISTS public.submission_scores (
    submission_id UUID PRIMARY KEY REFERENCES public.submissions(id) ON DELETE CASCADE,
    accuracy_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    is_gold_check BOOLEAN DEFAULT false,
    automated_grade JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Stored Procedure to Update Accuracy Score
CREATE OR REPLACE FUNCTION public.update_user_global_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET trust_score = (
        SELECT COALESCE(AVG(accuracy_score) * 10, 5.0) -- Scale to 0-10
        FROM public.submission_scores ss
        JOIN public.submissions s ON ss.submission_id = s.id
        WHERE s.user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;

    -- Also check for potential auto-ban
    IF (SELECT trust_score FROM public.users WHERE id = NEW.user_id) < 2.0 THEN
        UPDATE public.users SET is_active = false WHERE id = NEW.user_id;
        INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, new_data)
        VALUES (NULL, 'auto_ban', 'user', NEW.user_id, '{"reason": "trust_score_low"}');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for Accuracy Sync
CREATE TRIGGER on_score_added
    AFTER INSERT ON public.submission_scores
    FOR EACH ROW EXECUTE FUNCTION public.update_user_global_accuracy();

-- 5. Referral Bounty Release
CREATE OR REPLACE FUNCTION public.release_referral_bounty()
RETURNS TRIGGER AS $$
BEGIN
    -- If user completes their first successful task, reward the referrer
    IF (SELECT count(*) FROM public.submissions WHERE user_id = NEW.user_id AND status = 'approved') = 1 THEN
        UPDATE public.referrals 
        SET status = 'successful', bounty_paid = true
        WHERE referred_id = NEW.user_id AND status = 'pending';
        
        -- Add bounty to referrer's balance (e.g. $1.00)
        UPDATE public.users u
        SET balance = balance + 1.00
        FROM public.referrals r
        WHERE r.referred_id = NEW.user_id AND r.referrer_id = u.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_referral_completion
    AFTER UPDATE OF status ON public.submissions
    FOR EACH ROW 
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION public.release_referral_bounty();
