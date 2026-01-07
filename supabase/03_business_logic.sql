-- Business Logic Functions for XUM AI
-- Version: 1.0

-- 1. Task Feed Distribution
-- Returns a list of tasks tailored for the user based on level, trust score, and priority.
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

-- 2. Atomic Reward Processing (SECURED)
-- Handles the complex task of updating balances, XP, levels, and creating transaction records.
-- SECURITY: Validates ownership, derives reward from task (ignores frontend values), implements rate limiting
CREATE OR REPLACE FUNCTION public.process_task_reward(
  p_user_id UUID,
  p_submission_id UUID,
  p_reward DECIMAL DEFAULT NULL,  -- IGNORED: Kept for backward compatibility only
  p_xp INTEGER DEFAULT NULL       -- IGNORED: Kept for backward compatibility only
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
  v_recent_submissions INTEGER;
BEGIN
  -- ============================================
  -- SECURITY VALIDATION BLOCK
  -- ============================================
  
  -- 1. Lock and fetch submission with ownership verification
  SELECT s.id, s.user_id, s.task_id, s.status, s.submitted_at
  INTO v_submission
  FROM public.submissions s
  WHERE s.id = p_submission_id
  FOR UPDATE NOWAIT;  -- Fail immediately if another transaction is processing this
  
  IF v_submission IS NULL THEN
    RAISE EXCEPTION 'SECURITY: Submission not found: %', p_submission_id;
  END IF;
  
  -- 2. Verify caller owns this submission
  IF v_submission.user_id != p_user_id THEN
    -- Log security incident
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      p_user_id,
      'SECURITY_VIOLATION',
      'submission',
      p_submission_id,
      '{"violation": "user_mismatch"}'::jsonb,
      jsonb_build_object('claimed_user', p_user_id, 'actual_owner', v_submission.user_id)
    );
    RAISE EXCEPTION 'SECURITY: Submission % does not belong to user %', p_submission_id, p_user_id;
  END IF;
  
  -- 3. Prevent double-processing
  IF v_submission.status != 'pending' THEN
    RAISE EXCEPTION 'SECURITY: Submission % already processed with status: %', p_submission_id, v_submission.status;
  END IF;
  
  -- 4. Rate limiting check - max 10 rewards per minute per user
  SELECT COUNT(*) INTO v_recent_submissions
  FROM public.submissions
  WHERE user_id = p_user_id
    AND status = 'approved'
    AND reviewed_at > NOW() - INTERVAL '1 minute';
  
  IF v_recent_submissions >= 10 THEN
    RAISE EXCEPTION 'RATE_LIMIT: Too many submissions processed. Please wait.';
  END IF;
  
  -- 5. Get task details - DERIVE REWARD FROM TASK, NOT FRONTEND
  SELECT t.id, t.reward, t.xp_reward, t.status, t.current_submissions, t.max_submissions
  INTO v_task
  FROM public.tasks t
  WHERE t.id = v_submission.task_id
  FOR UPDATE;  -- Lock task row too
  
  IF v_task IS NULL OR v_task.status != 'active' THEN
    RAISE EXCEPTION 'SECURITY: Task is not active or not found';
  END IF;
  
  -- 6. Use server-side reward values (IGNORE frontend-provided p_reward and p_xp)
  v_actual_reward := v_task.reward;
  v_actual_xp := v_task.xp_reward;
  
  -- Log if frontend tried to manipulate reward
  IF p_reward IS NOT NULL AND p_reward != v_actual_reward THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      p_user_id,
      'REWARD_MANIPULATION_ATTEMPT',
      'submission',
      p_submission_id,
      jsonb_build_object('claimed_reward', p_reward, 'claimed_xp', p_xp),
      jsonb_build_object('actual_reward', v_actual_reward, 'actual_xp', v_actual_xp)
    );
  END IF;

  -- ============================================
  -- TRANSACTION PROCESSING BLOCK
  -- ============================================
  
  -- Mark submission as approved
  UPDATE public.submissions
  SET 
    status = 'approved',
    reviewed_at = now(),
    review_status = 'auto_approved'
  WHERE id = p_submission_id;

  -- Lock user row and update balance (atomic operation)
  UPDATE public.users
  SET 
    balance = balance + v_actual_reward,
    total_earned = total_earned + v_actual_reward,
    current_xp = current_xp + v_actual_xp,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING balance, current_xp, target_xp, level 
  INTO v_new_balance, v_new_xp, v_target_xp, v_current_level;
  
  -- Handle potential Level Up
  IF v_new_xp >= v_target_xp THEN
    UPDATE public.users
    SET 
      level = level + 1,
      current_xp = v_new_xp - v_target_xp,
      target_xp = target_xp + 50
    WHERE id = p_user_id;
    
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      p_user_id,
      'Level Up! 🎉',
      'You reached Level ' || (v_current_level + 1),
      'achievement_unlocked'
    );
  END IF;
  
  -- Record the transaction with ACTUAL (not claimed) values
  INSERT INTO public.transactions (user_id, type, amount, balance_after, submission_id, description)
  VALUES (
    p_user_id,
    'earning',
    v_actual_reward,
    v_new_balance,
    p_submission_id,
    'Task completion reward (Task: ' || v_task.id || ')'
  );
  
  -- Increment task submission count
  UPDATE public.tasks
  SET current_submissions = current_submissions + 1
  WHERE id = v_task.id;
  
  -- Log successful reward for audit trail
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (
    p_user_id,
    'REWARD_PROCESSED',
    'submission',
    p_submission_id,
    NULL,
    jsonb_build_object(
      'reward', v_actual_reward,
      'xp', v_actual_xp,
      'new_balance', v_new_balance,
      'task_id', v_task.id
    )
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'CONCURRENT: Another request is processing this submission. Please retry.';
  WHEN OTHERS THEN
    -- Log the error for debugging
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      p_user_id,
      'REWARD_ERROR',
      'submission',
      p_submission_id,
      NULL,
      jsonb_build_object('error', SQLERRM)
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Withdrawal Request with Escrow
-- Deducts funds from balance and creates a pending withdrawal record.
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
  -- Validate threshold
  IF p_amount < 5.00 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $5.00';
  END IF;
  
  -- Atomic check and lock
  SELECT balance INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: $%, Requested: $%', v_current_balance, p_amount;
  END IF;
  
  -- Deduct Immediately (Escrow)
  UPDATE public.users
  SET balance = balance - p_amount,
      total_withdrawn = total_withdrawn + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create Record
  INSERT INTO public.withdrawals (user_id, amount, method, account_details, status)
  VALUES (p_user_id, p_amount, p_method, p_account_details, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Transaction Ledger entry
  INSERT INTO public.transactions (user_id, type, amount, balance_after, withdrawal_id, description)
  VALUES (
    p_user_id,
    'withdrawal',
    -p_amount,
    v_new_balance,
    v_withdrawal_id,
    'Withdrawal request (' || p_method || ')'
  );
  
  -- Confirm with Notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    p_user_id,
    'Withdrawal Pending',
    'Your withdrawal request for $' || p_amount || ' has been received.',
    'withdrawal_processed'
  );
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
