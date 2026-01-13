-- ============================================
-- XUM AI Platform - Complete Database Setup
-- Version: 2.0 (Production Ready)
-- Run this FIRST in your new Supabase project
-- ============================================

-- ============================================
-- PART 0: PREREQUISITES (Missing Critical Tables)
-- ============================================

-- Audit Logs Table (Required by business logic functions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Rate Limiting Function (Required by multi-tenant isolation)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_max_requests INTEGER,
    p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.audit_logs
    WHERE actor_id = p_user_id
      AND action = p_action_type
      AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    RETURN v_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 1: CORE SCHEMA (00_schema.sql)
-- ============================================

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor', -- 'contributor', 'company', 'admin'
  
  -- Gamification
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  target_xp INTEGER DEFAULT 100,
  trust_score DECIMAL(3,1) DEFAULT 5.0,
  
  -- Financial
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  
  -- Profile
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'en',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_role CHECK (role IN ('contributor', 'company', 'admin')),
  CONSTRAINT valid_trust_score CHECK (trust_score >= 0 AND trust_score <= 10)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  
  reward DECIMAL(10,2) NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  
  time_estimate VARCHAR(50), 
  max_submissions INTEGER DEFAULT 1000,
  current_submissions INTEGER DEFAULT 0,
  
  min_trust_score DECIMAL(3,1) DEFAULT 5.0,
  min_level INTEGER DEFAULT 1,
  required_languages TEXT[], 
  
  is_priority BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_task_type CHECK (task_type IN ('audio', 'image', 'text', 'validation', 'linguasense', 'rlhf')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  CONSTRAINT positive_reward CHECK (reward > 0)
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  submission_data JSONB NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending',
  review_status VARCHAR(20),
  quality_score DECIMAL(3,2),
  
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  time_spent_seconds INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON public.submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- 4. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  account_details JSONB NOT NULL, 
  
  status VARCHAR(20) DEFAULT 'pending',
  processed_by UUID REFERENCES public.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  external_transaction_id VARCHAR(255),
  rejection_reason TEXT,
  
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_method CHECK (method IN ('paypal', 'bank_transfer', 'crypto_usdc')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  CONSTRAINT min_withdrawal CHECK (amount >= 5.00)
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  
  submission_id UUID REFERENCES public.submissions(id),
  withdrawal_id UUID REFERENCES public.withdrawals(id),
  
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_type CHECK (type IN ('earning', 'withdrawal', 'bonus', 'penalty', 'refund'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  action_url VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ============================================
-- PART 2: AUTH TRIGGERS (01_auth_triggers.sql)
-- ============================================

-- Auto-create user profile when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'contributor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 3: ROW LEVEL SECURITY (02_rls_policies.sql)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Tasks Policies
CREATE POLICY "Anyone can view active tasks" ON public.tasks
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can view their tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Creators can insert tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = created_by OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins have full task access" ON public.tasks
  FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Submissions Policies
CREATE POLICY "Users can view own submissions" ON public.submissions
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'company'));

CREATE POLICY "Users can create submissions" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage submissions" ON public.submissions
  FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Withdrawals Policies
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals
  FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs: Admin read-only
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================
-- PART 4: PLATFORM GOVERNANCE (05_governance.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES public.users(id)
);

INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('maintenance_mode', 'false', 'Disable all user task submissions'),
    ('min_withdrawal_amount', '5.00', 'Minimum USD for withdrawal requests'),
    ('task_types_enabled', '["audio", "image", "text", "validation", "linguasense", "rlhf"]', 'Allowed mission protocols'),
    ('global_announcement', '{"text": "", "active": false}', 'Banner message for all users')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings" 
    ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify platform settings" 
    ON public.platform_settings FOR ALL 
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================
-- PART 5: CORE BUSINESS LOGIC (03_business_logic.sql)
-- ============================================

-- Get personalized task feed for user
CREATE OR REPLACE FUNCTION public.get_user_task_feed(
  p_user_id UUID,
  p_task_type VARCHAR DEFAULT NULL,
  p_difficulty VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  task_type VARCHAR,
  difficulty VARCHAR,
  reward DECIMAL,
  xp_reward INTEGER,
  time_estimate VARCHAR,
  is_priority BOOLEAN,
  priority_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.task_type,
    t.difficulty,
    t.reward,
    t.xp_reward,
    t.time_estimate,
    t.is_priority,
    (
      CASE WHEN t.is_priority THEN 10.0 ELSE 0.0 END +
      (10.0 - (t.current_submissions::DECIMAL / NULLIF(t.max_submissions, 0) * 10.0)) +
      (t.reward / 10.0)
    ) AS priority_score
  FROM public.tasks t
  INNER JOIN public.users u ON u.id = p_user_id
  WHERE t.status = 'active'
    AND t.current_submissions < t.max_submissions
    AND u.trust_score >= t.min_trust_score
    AND u.level >= t.min_level
    AND (t.deadline IS NULL OR t.deadline > now())
    AND (p_task_type IS NULL OR t.task_type = p_task_type)
    AND (p_difficulty IS NULL OR t.difficulty = p_difficulty)
  ORDER BY priority_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process task reward (secure, server-side validation)
CREATE OR REPLACE FUNCTION public.process_task_reward(
  p_user_id UUID,
  p_submission_id UUID,
  p_reward DECIMAL DEFAULT NULL,
  p_xp INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_balance DECIMAL;
  v_new_xp INTEGER;
  v_target_xp INTEGER;
  v_current_level INTEGER;
  v_submission RECORD;
  v_task RECORD;
  v_actual_reward DECIMAL;
  v_actual_xp INTEGER;
BEGIN
  -- Lock and fetch submission
  SELECT s.id, s.user_id, s.task_id, s.status
  INTO v_submission
  FROM public.submissions s
  WHERE s.id = p_submission_id
  FOR UPDATE NOWAIT;
  
  IF v_submission IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  IF v_submission.user_id != p_user_id THEN
    RAISE EXCEPTION 'Submission does not belong to user';
  END IF;
  
  IF v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'Submission already processed';
  END IF;
  
  -- Get task (derive reward from task, not frontend)
  SELECT t.id, t.reward, t.xp_reward, t.status
  INTO v_task
  FROM public.tasks t
  WHERE t.id = v_submission.task_id
  FOR UPDATE;
  
  IF v_task IS NULL OR v_task.status != 'active' THEN
    RAISE EXCEPTION 'Task is not active';
  END IF;
  
  v_actual_reward := v_task.reward;
  v_actual_xp := v_task.xp_reward;
  
  -- Mark submission as approved
  UPDATE public.submissions
  SET status = 'approved', reviewed_at = now(), review_status = 'auto_approved'
  WHERE id = p_submission_id;

  -- Update user balance and XP
  UPDATE public.users
  SET 
    balance = balance + v_actual_reward,
    total_earned = total_earned + v_actual_reward,
    current_xp = current_xp + v_actual_xp,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING balance, current_xp, target_xp, level 
  INTO v_new_balance, v_new_xp, v_target_xp, v_current_level;
  
  -- Handle Level Up
  IF v_new_xp >= v_target_xp THEN
    UPDATE public.users
    SET level = level + 1, current_xp = v_new_xp - v_target_xp, target_xp = target_xp + 50
    WHERE id = p_user_id;
    
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (p_user_id, 'Level Up! 🎉', 'You reached Level ' || (v_current_level + 1), 'achievement_unlocked');
  END IF;
  
  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, balance_after, submission_id, description)
  VALUES (p_user_id, 'earning', v_actual_reward, v_new_balance, p_submission_id, 'Task completion reward');
  
  -- Increment task submission count
  UPDATE public.tasks SET current_submissions = current_submissions + 1 WHERE id = v_task.id;
  
  RETURN TRUE;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Another request is processing this submission';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Request withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL,
  p_method VARCHAR,
  p_account_details JSONB
)
RETURNS UUID AS $$
DECLARE
  v_withdrawal_id UUID;
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
BEGIN
  IF p_amount < 5.00 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $5.00';
  END IF;
  
  SELECT balance INTO v_current_balance FROM public.users WHERE id = p_user_id FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  UPDATE public.users
  SET balance = balance - p_amount, total_withdrawn = total_withdrawn + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  INSERT INTO public.withdrawals (user_id, amount, method, account_details, status)
  VALUES (p_user_id, p_amount, p_method, p_account_details, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  INSERT INTO public.transactions (user_id, type, amount, balance_after, withdrawal_id, description)
  VALUES (p_user_id, 'withdrawal', -p_amount, v_new_balance, v_withdrawal_id, 'Withdrawal request (' || p_method || ')');
  
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Withdrawal Pending', 'Your withdrawal request for $' || p_amount || ' has been received.', 'withdrawal_processed');
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next Steps:
-- 1. Create your first admin user via Supabase Auth
-- 2. Update their role to 'admin' in the users table
-- 3. Connect your apps with the Supabase URL and anon key
