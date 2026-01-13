-- Business Logic Functions for XUM AI
-- Version: 2.1 (Idempotent Edition)

-- 1. Create Project with Budget Lock
DROP FUNCTION IF EXISTS public.create_company_project(UUID, TEXT, TEXT, TEXT, INTEGER, DECIMAL, DECIMAL);
CREATE OR REPLACE FUNCTION public.create_company_project(
  p_company_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_task_type TEXT,
  p_target INTEGER,
  p_bid DECIMAL,
  p_fee_percent DECIMAL DEFAULT 15.0
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
  v_total_cost DECIMAL;
BEGIN
  v_total_cost := (p_target * p_bid) * (1 + (p_fee_percent / 100));
  
  INSERT INTO public.tasks (
    company_id, title, description, task_type, target_submissions, reward_per_submission, platform_fee_percent, total_budget, status
  ) VALUES (
    p_company_id, p_title, p_description, p_task_type, p_target, p_bid, p_fee_percent, v_total_cost, 'pending_review'
  ) RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Process Contributor Reward
DROP FUNCTION IF EXISTS public.process_task_reward(UUID, UUID, DECIMAL, INTEGER);
CREATE OR REPLACE FUNCTION public.process_task_reward(
  p_user_id UUID,
  p_submission_id UUID,
  p_reward DECIMAL,
  p_xp INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_balance DECIMAL;
  v_new_xp INTEGER;
  v_target_xp INTEGER;
BEGIN
  -- Mark submission as approved
  UPDATE public.submissions SET status = 'approved', reviewed_at = now() WHERE id = p_submission_id;

  -- Update user balance and XP
  UPDATE public.users SET 
    balance = balance + p_reward,
    total_earned = total_earned + p_reward,
    current_xp = current_xp + p_xp,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING current_xp, target_xp INTO v_new_xp, v_target_xp;
  
  -- Handle Level Up
  IF v_new_xp >= v_target_xp THEN
    UPDATE public.users SET 
      level = level + 1,
      current_xp = v_new_xp - v_target_xp,
      target_xp = target_xp + 50
    WHERE id = p_user_id;
  END IF;
  
  -- Increment task count
  UPDATE public.tasks SET current_submissions = current_submissions + 1 
  WHERE id = (SELECT task_id FROM public.submissions WHERE id = p_submission_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Analytics: Overview Stats
DROP FUNCTION IF EXISTS public.get_company_analytics_overview(UUID);
CREATE OR REPLACE FUNCTION public.get_company_analytics_overview(p_company_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_projects', COUNT(*),
    'active_projects', COUNT(*) FILTER (WHERE status = 'active'),
    'total_submissions', COALESCE(SUM(current_submissions), 0),
    'total_approved', (SELECT COUNT(*) FROM public.submissions s JOIN public.tasks t ON s.task_id = t.id WHERE t.company_id = p_company_id AND s.status = 'approved'),
    'avg_accuracy', 98.5, -- Placeholder
    'total_workers', (SELECT COUNT(DISTINCT user_id) FROM public.submissions s JOIN public.tasks t ON s.task_id = t.id WHERE t.company_id = p_company_id),
    'top_performers', 5,
    'total_spend', (SELECT COALESCE(total_spent, 0) FROM public.company_wallets WHERE company_id = p_company_id)
  ) INTO v_result
  FROM public.tasks
  WHERE company_id = p_company_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Analytics: Time Series
DROP FUNCTION IF EXISTS public.get_analytics_time_series(UUID, INTEGER, UUID);
CREATE OR REPLACE FUNCTION public.get_analytics_time_series(p_company_id UUID, p_days INTEGER, p_project_id UUID DEFAULT NULL)
RETURNS TABLE (
  date TEXT,
  submissions BIGINT,
  approved BIGINT,
  rejected BIGINT,
  accuracy DECIMAL,
  workers BIGINT,
  spend DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(CURRENT_DATE - (p_days - 1) * INTERVAL '1 day', CURRENT_DATE, INTERVAL '1 day')::DATE AS d
  )
  SELECT 
    dr.d::TEXT,
    COUNT(s.id) FILTER (WHERE s.submitted_at::DATE = dr.d),
    COUNT(s.id) FILTER (WHERE s.status = 'approved' AND s.submitted_at::DATE = dr.d),
    COUNT(s.id) FILTER (WHERE s.status = 'rejected' AND s.submitted_at::DATE = dr.d),
    98.0::DECIMAL, -- Placeholder
    COUNT(DISTINCT s.user_id) FILTER (WHERE s.submitted_at::DATE = dr.d),
    COALESCE(SUM(t.reward_per_submission) FILTER (WHERE s.status = 'approved' AND s.submitted_at::DATE = dr.d), 0)
  FROM date_range dr
  LEFT JOIN public.submissions s ON s.submitted_at::DATE = dr.d
  LEFT JOIN public.tasks t ON s.task_id = t.id
  WHERE (t.company_id = p_company_id OR t.id IS NULL)
    AND (p_project_id IS NULL OR t.id = p_project_id)
  GROUP BY dr.d
  ORDER BY dr.d ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

