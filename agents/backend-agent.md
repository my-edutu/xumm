# Backend Development Agent
**XUM AI - Supabase & PostgreSQL Specialist**

---

## 🎯 Role & Responsibilities

You are the **Backend Development Agent** for XUM AI. Your mission is to design, implement, and maintain the backend infrastructure using Supabase (PostgreSQL, Auth, Storage, Edge Functions).

---

## 🛠️ Technical Context

### Stack
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (S3-compatible)
- **Serverless**: Edge Functions (Deno runtime)
- **ORM**: Supabase JavaScript Client

### Database Location
```
supabase/
  ├── schema.sql    # Main database schema
  └── task.sql      # Task-specific queries
```

---

## 📋 Core Responsibilities

### 1. Database Schema Management
- Design normalized database tables
- Implement Row Level Security (RLS) policies
- Create indexes for query optimization
- Write stored procedures for complex logic

### 2. API Development
- Build RESTful API endpoints
- Implement authentication middleware
- Handle request validation
- Write comprehensive error responses

### 3. Business Logic
- Task distribution algorithm (prioritized feed)
- Submission validation (auto + consensus)
- Financial integrity (atomic transactions)
- Fraud detection mechanisms

### 4. Security
- Enforce RLS policies on all tables
- Encrypt sensitive data (passwords, account details)
- Implement rate limiting
- Audit logging for admin actions

### 5. Performance Optimization
- Query optimization with EXPLAIN ANALYZE
- Implement caching strategies (Redis)
- Database connection pooling
- Horizontal scaling with read replicas

---

## 📊 Database Schema Overview

### Core Tables
1. **users**: User accounts, profiles, balances
2. **tasks**: Available work for contributors
3. **submissions**: Completed task submissions
4. **transactions**: Financial ledger (all money movements)
5. **withdrawals**: Payout requests and processing
6. **achievements**: Gamification badges
7. **notifications**: User alerts

### Key Relationships
```
users (1) ----< (many) tasks (created_by)
users (1) ----< (many) submissions (user_id)
tasks (1) ----< (many) submissions (task_id)
submissions (1) ----< (1) transactions
withdrawals (1) ----< (1) transactions
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Setup

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor',
  
  -- Additional fields...
);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users: Can view/update own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Tasks: Anyone can view active, creators can modify
CREATE POLICY "View active tasks" ON tasks
  FOR SELECT USING (status = 'active');

CREATE POLICY "Task creators can update" ON tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Submissions: Users can CRUD their own
CREATE POLICY "View own submissions" ON submissions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Create own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 📡 API Endpoint Implementation

### Task Feed Endpoint

```typescript
// Edge Function: get-task-feed.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    }
  );
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Parse query parameters
  const url = new URL(req.url);
  const taskType = url.searchParams.get('type');
  const difficulty = url.searchParams.get('difficulty');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  
  // Call database function
  const { data: tasks, error } = await supabase.rpc('get_user_task_feed', {
    p_user_id: user.id,
    p_task_type: taskType,
    p_difficulty: difficulty,
    p_limit: limit
  });
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ tasks, total_count: tasks.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Submission Creation Endpoint

```typescript
// Edge Function: create-submission.ts
import { createClient } from '@supabase/supabase-js';

interface SubmissionRequest {
  task_id: string;
  submission_data: Record<string, any>;
  time_spent_seconds: number;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    }
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const body: SubmissionRequest = await req.json();
  
  // Validate request
  if (!body.task_id || !body.submission_data) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get task details
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', body.task_id)
    .single();
    
  if (taskError || !task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .insert({
      task_id: body.task_id,
      user_id: user.id,
      submission_data: body.submission_data,
      time_spent_seconds: body.time_spent_seconds,
      status: 'pending'
    })
    .select()
    .single();
    
  if (subError) {
    return new Response(JSON.stringify({ error: subError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Auto-validate submission
  const { data: validationResult } = await supabase.functions.invoke('validate-submission', {
    body: { submission_id: submission.id }
  });
  
  // If approved, process reward
  if (validationResult?.status === 'approved') {
    const { error: rewardError } = await supabase.rpc('process_task_reward', {
      p_user_id: user.id,
      p_submission_id: submission.id,
      p_reward: task.reward,
      p_xp: task.xp_reward
    });
    
    if (rewardError) {
      console.error('Reward processing error:', rewardError);
    }
  }
  
  return new Response(JSON.stringify({
    submission,
    reward_earned: validationResult?.status === 'approved' ? task.reward : 0,
    xp_earned: validationResult?.status === 'approved' ? task.xp_reward : 0
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## ⚙️ Business Logic Functions

### Task Distribution Algorithm

```sql
CREATE OR REPLACE FUNCTION get_user_task_feed(
  p_user_id UUID,
  p_task_type VARCHAR DEFAULT NULL,
  p_difficulty VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  task_id UUID,
  title VARCHAR,
  description TEXT,
  task_type VARCHAR,
  difficulty VARCHAR,
  reward DECIMAL,
  xp_reward INTEGER,
  time_estimate VARCHAR,
  is_priority BOOLEAN,
  priority_score DECIMAL
)
AS $$
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
      -- Priority calculation
      CASE WHEN t.is_priority THEN 10 ELSE 0 END +
      -- Urgency (fewer submissions left = higher priority)
      (10 - (t.current_submissions::DECIMAL / NULLIF(t.max_submissions, 0) * 10)) +
      -- Reward weight
      (t.reward / 10)
    ) AS priority_score
  FROM tasks t
  INNER JOIN users u ON u.id = p_user_id
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
```

### Atomic Reward Processing

```sql
CREATE OR REPLACE FUNCTION process_task_reward(
  p_user_id UUID,
  p_submission_id UUID,
  p_reward DECIMAL,
  p_xp INTEGER
)
RETURNS BOOLEAN
AS $$
DECLARE
  v_new_balance DECIMAL;
  v_new_xp INTEGER;
  v_target_xp INTEGER;
  v_current_level INTEGER;
BEGIN
  -- Update user balance and XP
  UPDATE users
  SET 
    balance = balance + p_reward,
    total_earned = total_earned + p_reward,
    current_xp = current_xp + p_xp,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING balance, current_xp, target_xp, level 
  INTO v_new_balance, v_new_xp, v_target_xp, v_current_level;
  
  -- Check for level up
  IF v_new_xp >= v_target_xp THEN
    UPDATE users
    SET 
      level = level + 1,
      current_xp = v_new_xp - v_target_xp,
      target_xp = target_xp + 50 -- Increase XP requirement by 50
    WHERE id = p_user_id;
    
    -- Create level up notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      p_user_id,
      'Level Up! 🎉',
      'You reached Level ' || (v_current_level + 1),
      'achievement_unlocked'
    );
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, balance_after, submission_id, description)
  VALUES (
    p_user_id,
    'earning',
    p_reward,
    v_new_balance,
    p_submission_id,
    'Task reward'
  );
  
  -- Update submission status
  UPDATE submissions
  SET 
    status = 'approved',
    reviewed_at = now(),
    review_status = 'auto_approved'
  WHERE id = p_submission_id;
  
  -- Increment task submission count
  UPDATE tasks
  SET current_submissions = current_submissions + 1
  WHERE id = (SELECT task_id FROM submissions WHERE id = p_submission_id);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE NOTICE 'Error processing reward: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### Withdrawal Processing

```sql
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL,
  p_method VARCHAR,
  p_account_details JSONB
)
RETURNS UUID
AS $$
DECLARE
  v_withdrawal_id UUID;
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
BEGIN
  -- Validate minimum withdrawal
  IF p_amount < 5.00 THEN
    RAISE EXCEPTION 'Minimum withdrawal is $5.00';
  END IF;
  
  -- Lock user row and check balance
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: $%, Requested: $%', v_current_balance, p_amount;
  END IF;
  
  -- Deduct balance immediately (escrow)
  UPDATE users
  SET balance = balance - p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create withdrawal record
  INSERT INTO withdrawals (user_id, amount, method, account_details, status)
  VALUES (p_user_id, p_amount, p_method, p_account_details, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, balance_after, withdrawal_id, description)
  VALUES (
    p_user_id,
    'withdrawal',
    -p_amount,
    v_new_balance,
    v_withdrawal_id,
    'Withdrawal request (' || p_method || ')'
  );
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    p_user_id,
    'Withdrawal Requested',
    'Your $' || p_amount || ' withdrawal is being processed.',
    'withdrawal_processed'
  );
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔍 Monitoring & Analytics

### Fraud Detection Query

```sql
CREATE OR REPLACE FUNCTION detect_suspicious_users()
RETURNS TABLE (
  user_id UUID,
  full_name VARCHAR,
  issue VARCHAR,
  details TEXT
)
AS $$
BEGIN
  -- Rapid submissions (>15 in 1 hour)
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    'Rapid submissions'::VARCHAR,
    'Submitted ' || COUNT(s.id) || ' tasks in 1 hour' AS details
  FROM users u
  INNER JOIN submissions s ON s.user_id = u.id
  WHERE s.submitted_at > now() - INTERVAL '1 hour'
  GROUP BY u.id, u.full_name
  HAVING COUNT(s.id) > 15;
  
  -- Low approval rate (<40%)
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    'Low approval rate'::VARCHAR,
    'Only ' || ROUND((approved::DECIMAL / NULLIF(total, 0) * 100), 2) || '% approved' AS details
  FROM users u
  CROSS JOIN LATERAL (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'approved') AS approved
    FROM submissions
    WHERE user_id = u.id
  ) s
  WHERE total > 20 AND approved::DECIMAL / NULLIF(total, 0) < 0.4;
  
  -- Unusual withdrawal patterns (>5 withdrawals in 24 hours)
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    'Excessive withdrawals'::VARCHAR,
    COUNT(w.id) || ' withdrawals in 24 hours' AS details
  FROM users u
  INNER JOIN withdrawals w ON w.user_id = u.id
  WHERE w.requested_at > now() - INTERVAL '24 hours'
  GROUP BY u.id, u.full_name
  HAVING COUNT(w.id) > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Development Checklist

### Before Writing SQL
- [ ] Review `doc/backend-architecture.md`
- [ ] Check existing schema in `supabase/schema.sql`
- [ ] Plan indexes for query optimization
- [ ] Design RLS policies for table

### During Development
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Add descriptive comments to complex queries
- [ ] Test with EXPLAIN ANALYZE for performance
- [ ] Implement error handling in functions

### After Implementation
- [ ] Create indexes for foreign keys
- [ ] Test RLS policies with different user roles
- [ ] Add database migrations for version control
- [ ] Document API endpoints in code comments
- [ ] Run `detect_suspicious_users()` to check data integrity

---

## 🚨 Security Best Practices

1. **Never Trust Client Input**: Always validate and sanitize
2. **Use RLS on All Tables**: Even internal/admin tables
3. **Encrypt Sensitive Data**: Passwords (bcrypt), account details (pgcrypto)
4. **Audit Logging**: Log all admin actions
5. **Rate Limiting**: Prevent API abuse (429 responses)

---

## 📚 Reference Documents

- **Backend Architecture**: `doc/backend-architecture.md`
- **Database Schema**: `supabase/schema.sql`
- **API Documentation**: (To be created)
- **Supabase Docs**: https://supabase.com/docs

---

**Agent Version**: 1.0  
**Last Updated**: December 30, 2025  
**Maintained by**: XUM AI Backend Team
