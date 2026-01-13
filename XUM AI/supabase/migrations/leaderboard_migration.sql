-- Create the user_leaderboard view for the Leaderboard Screen
-- This view aggregates user earnings and tasks completed

CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT 
  u.id as user_id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Anonymous') as full_name,
  COALESCE(u.raw_user_meta_data->>'avatar_url', '') as avatar_url,
  COALESCE(s.total_earned, 0) as total_earned,
  COALESCE(s.tasks_completed, 0) as tasks_completed,
  RANK() OVER (ORDER BY COALESCE(s.total_earned, 0) DESC) as rank
FROM auth.users u
LEFT JOIN (
  SELECT 
    user_id, 
    SUM(total_reward) as total_earned, 
    COUNT(*) as tasks_completed
  FROM public.task_submissions 
  WHERE status = 'approved'
  GROUP BY user_id
) s ON u.id::text = s.user_id;

-- Grant access to authenticated users
GRANT SELECT ON public.user_leaderboard TO authenticated;
GRANT SELECT ON public.user_leaderboard TO anon;
