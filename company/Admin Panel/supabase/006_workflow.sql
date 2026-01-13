-- XUM AI Business Workflow Functions
-- Version: 3.0 - Complete Company → Admin → Worker Pipeline

-- ============================================
-- STEP 1: COMPANY SUBMITS PROJECT FOR REVIEW
-- ============================================
DROP FUNCTION IF EXISTS public.submit_project_for_review(UUID, TEXT, TEXT, TEXT, INTEGER, DECIMAL);
CREATE OR REPLACE FUNCTION public.submit_project_for_review(
  p_company_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_task_type TEXT,
  p_target_submissions INTEGER,
  p_reward_per_item DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
  v_platform_fee DECIMAL := 0.15; -- 15%
  v_total_cost DECIMAL;
BEGIN
  -- Calculate total project cost (rewards + platform fee)
  v_total_cost := (p_target_submissions * p_reward_per_item) * (1 + v_platform_fee);
  
  -- Create the task in pending_review status
  INSERT INTO public.tasks (
    company_id, 
    title, 
    description, 
    task_type, 
    target_submissions, 
    reward_per_submission, 
    platform_fee_percent,
    total_budget,
    status
  ) VALUES (
    p_company_id, 
    p_title, 
    p_description, 
    p_task_type, 
    p_target_submissions, 
    p_reward_per_item, 
    v_platform_fee * 100,
    v_total_cost,
    'pending_review'
  ) RETURNING id INTO v_task_id;
  
  -- Notify all admins
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, 
         'New Project Submission',
         'A new project "' || p_title || '" requires your review. Budget: $' || v_total_cost,
         'admin_message'
  FROM public.users 
  WHERE role = 'admin';
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: ADMIN APPROVES PROJECT (LOCKS FUNDS)
-- ============================================
DROP FUNCTION IF EXISTS public.admin_approve_project(UUID, UUID, DECIMAL);
CREATE OR REPLACE FUNCTION public.admin_approve_project(
  p_admin_id UUID,
  p_task_id UUID,
  p_final_reward DECIMAL DEFAULT NULL -- Admin can override pricing
)
RETURNS BOOLEAN AS $$
DECLARE
  v_task RECORD;
  v_company_balance DECIMAL;
  v_owner_id UUID;
  v_total_to_lock DECIMAL;
BEGIN
  -- Get task details
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  
  IF v_task IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  IF v_task.status != 'pending_review' THEN
    RAISE EXCEPTION 'Task is not pending review';
  END IF;
  
  -- Use admin's price if provided, otherwise use company's bid
  IF p_final_reward IS NOT NULL THEN
    v_total_to_lock := (v_task.target_submissions * p_final_reward) * (1 + v_task.platform_fee_percent / 100);
    UPDATE public.tasks SET reward_per_submission = p_final_reward, total_budget = v_total_to_lock WHERE id = p_task_id;
  ELSE
    v_total_to_lock := v_task.total_budget;
  END IF;
  
  -- Check company has sufficient funds
  SELECT available_balance INTO v_company_balance 
  FROM public.company_wallets 
  WHERE company_id = v_task.company_id;
  
  IF v_company_balance < v_total_to_lock THEN
    RAISE EXCEPTION 'Insufficient company funds. Required: $%, Available: $%', v_total_to_lock, v_company_balance;
  END IF;
  
  -- Lock funds (move to pending_balance as escrow)
  UPDATE public.company_wallets 
  SET 
    available_balance = available_balance - v_total_to_lock,
    pending_balance = pending_balance + v_total_to_lock
  WHERE company_id = v_task.company_id;
  
  -- Record the escrow transaction
  INSERT INTO public.financial_ledger (company_id, amount, type, description, reference_id)
  VALUES (
    v_task.company_id,
    -v_total_to_lock,
    'escrow_lock',
    'Funds locked for project: ' || v_task.title,
    v_task_id::text
  );
  
  -- Activate the task
  UPDATE public.tasks 
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = p_task_id;
  
  -- Notify the company owner
  SELECT owner_id INTO v_owner_id FROM public.companies WHERE id = v_task.company_id;
  
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_owner_id,
    'Project Approved! 🎉',
    'Your project "' || v_task.title || '" has been approved and is now live.',
    'task_completion'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: ADMIN REJECTS PROJECT
-- ============================================
DROP FUNCTION IF EXISTS public.admin_reject_project(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION public.admin_reject_project(
  p_admin_id UUID,
  p_task_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_task RECORD;
  v_owner_id UUID;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  
  IF v_task IS NULL OR v_task.status != 'pending_review' THEN
    RAISE EXCEPTION 'Task not found or not pending';
  END IF;
  
  -- Mark as rejected
  UPDATE public.tasks SET status = 'rejected', updated_at = now() WHERE id = p_task_id;
  
  -- Notify company
  SELECT owner_id INTO v_owner_id FROM public.companies WHERE id = v_task.company_id;
  
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_owner_id,
    'Project Needs Revision',
    'Your project "' || v_task.title || '" was not approved. Reason: ' || p_reason,
    'admin_message'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: WORKER SUBMITS WORK
-- ============================================
DROP FUNCTION IF EXISTS public.worker_submit_task(UUID, UUID, JSONB);
CREATE OR REPLACE FUNCTION public.worker_submit_task(
  p_user_id UUID,
  p_task_id UUID,
  p_submission_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_task RECORD;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  
  IF v_task IS NULL OR v_task.status != 'active' THEN
    RAISE EXCEPTION 'Task is not available';
  END IF;
  
  IF v_task.current_submissions >= v_task.target_submissions THEN
    RAISE EXCEPTION 'Task has reached submission limit';
  END IF;
  
  -- Create submission
  INSERT INTO public.submissions (task_id, user_id, submission_data, status)
  VALUES (p_task_id, p_user_id, p_submission_data, 'pending')
  RETURNING id INTO v_submission_id;
  
  -- Increment counter
  UPDATE public.tasks 
  SET current_submissions = current_submissions + 1 
  WHERE id = p_task_id;
  
  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: APPROVE SUBMISSION & PAY WORKER
-- ============================================
DROP FUNCTION IF EXISTS public.approve_submission_and_pay(UUID, UUID);
CREATE OR REPLACE FUNCTION public.approve_submission_and_pay(
  p_admin_id UUID,
  p_submission_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_submission RECORD;
  v_task RECORD;
  v_reward DECIMAL;
  v_xp INTEGER := 10;
BEGIN
  SELECT * INTO v_submission FROM public.submissions WHERE id = p_submission_id;
  SELECT * INTO v_task FROM public.tasks WHERE id = v_submission.task_id;
  
  IF v_submission IS NULL OR v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
  
  v_reward := v_task.reward_per_submission;
  
  -- Mark submission approved
  UPDATE public.submissions 
  SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = now()
  WHERE id = p_submission_id;
  
  -- Pay the worker
  UPDATE public.users 
  SET 
    balance = balance + v_reward,
    total_earned = total_earned + v_reward,
    current_xp = current_xp + v_xp
  WHERE id = v_submission.user_id;
  
  -- Release funds from company escrow
  UPDATE public.company_wallets
  SET 
    pending_balance = pending_balance - v_reward,
    total_spent = total_spent + v_reward
  WHERE company_id = v_task.company_id;
  
  -- Record the release
  INSERT INTO public.financial_ledger (company_id, amount, type, description, reference_id)
  VALUES (
    v_task.company_id,
    -v_reward,
    'escrow_release',
    'Payment to worker for task: ' || v_task.title,
    p_submission_id::text
  );
  
  -- Notify worker
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_submission.user_id,
    'Submission Approved! 💰',
    'You earned $' || v_reward || ' for your work on "' || v_task.title || '"',
    'task_completion'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN VIEWS: Pending Projects & Submissions
-- ============================================
DROP VIEW IF EXISTS public.admin_pending_projects CASCADE;
CREATE VIEW public.admin_pending_projects AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.task_type,
    t.target_submissions,
    t.reward_per_submission,
    t.total_budget,
    t.created_at,
    c.name AS company_name,
    cw.available_balance AS company_balance
FROM public.tasks t
JOIN public.companies c ON t.company_id = c.id
LEFT JOIN public.company_wallets cw ON c.id = cw.company_id
WHERE t.status = 'pending_review'
ORDER BY t.created_at DESC;

DROP VIEW IF EXISTS public.admin_pending_submissions CASCADE;
CREATE VIEW public.admin_pending_submissions AS
SELECT 
    s.id,
    s.submission_data,
    s.submitted_at,
    t.title AS task_title,
    t.reward_per_submission,
    u.full_name AS worker_name,
    u.email AS worker_email
FROM public.submissions s
JOIN public.tasks t ON s.task_id = t.id
JOIN public.users u ON s.user_id = u.id
WHERE s.status = 'pending'
ORDER BY s.submitted_at DESC;
