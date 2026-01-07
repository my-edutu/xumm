# XUM AI - Backend Architecture
**Comprehensive Backend Infrastructure Design**

---

## 🏗️ Architecture Overview

### Stack Components

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + TypeScript)         │
│              Vite Build System                  │
└────────────────────┬────────────────────────────┘
                     │
                     ↓ HTTPS/REST API
┌─────────────────────────────────────────────────┐
│         Supabase Backend Services               │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Auth     │  │   DB     │  │  Storage     │ │
│  │  (JWT)    │  │ PostreSQL│  │  (S3-like)   │ │
│  └───────────┘  └──────────┘  └──────────────┘ │
│                                                 │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Realtime  │  │  Edge    │  │  Functions   │ │
│  │ (WebSock.)│  │ Functions│  │  (Serverless)│ │
│  └───────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────┘
                     │
                     ↓ Database Queries
┌─────────────────────────────────────────────────┐
│          PostgreSQL Database                    │
│  - Users, Tasks, Submissions, Transactions      │
│  - Row Level Security (RLS)                     │
│  - Triggers & Functions                         │
└─────────────────────────────────────────────────┘
                     │
                     ↓ Scheduled Jobs
┌─────────────────────────────────────────────────┐
│          Background Services                    │
│  - Task validation (AI models)                  │
│  - Payout processing (cron jobs)                │
│  - Analytics aggregation                        │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor', -- 'contributor', 'company', 'admin'
  
  -- Gamification
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  target_xp INTEGER DEFAULT 100,
  trust_score DECIMAL(3,1) DEFAULT 5.0, -- 0.0 to 10.0
  
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
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('contributor', 'company', 'admin')),
  CONSTRAINT valid_trust_score CHECK (trust_score >= 0 AND trust_score <= 10)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_trust_score ON users(trust_score);
```

#### 2. Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  task_type VARCHAR(50) NOT NULL, -- 'audio', 'image', 'text', 'validation', 'linguasense', 'rlhf'
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  
  -- Rewards
  reward DECIMAL(6,2) NOT NULL, -- $0.00 to $9999.99
  xp_reward INTEGER DEFAULT 10,
  
  -- Logistics
  time_estimate VARCHAR(50), -- "15-30 minutes"
  max_submissions INTEGER DEFAULT 1000,
  current_submissions INTEGER DEFAULT 0,
  
  -- Requirements
  min_trust_score DECIMAL(3,1) DEFAULT 5.0,
  min_level INTEGER DEFAULT 1,
  required_languages TEXT[], -- ['en', 'es']
  
  -- Priority & Status
  is_priority BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed', 'archived'
  
  -- Metadata
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_task_type CHECK (task_type IN ('audio', 'image', 'text', 'validation', 'linguasense', 'rlhf')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  CONSTRAINT positive_reward CHECK (reward > 0)
);

-- Indexes
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(is_priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
```

#### 3. Submissions Table
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Submission Data
  submission_data JSONB NOT NULL, -- Flexible structure for different task types
  /*
    Example structures:
    Audio: { "audio_url": "...", "duration": 120, "transcript": "..." }
    Image: { "image_url": "...", "labels": [...], "annotations": [...] }
    Text: { "text_content": "...", "word_count": 450 }
    Validation: { "choices": [...], "confidence": 0.95 }
  */
  
  -- Review Process
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revision_requested'
  review_status VARCHAR(20), -- 'auto_approved', 'human_reviewed', 'consensus_validated'
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Admin Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Flags
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  -- Metadata
  time_spent_seconds INTEGER, -- Track how long user took
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 1)
);

-- Indexes
CREATE INDEX idx_submissions_task_id ON submissions(task_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_flagged ON submissions(is_flagged);
```

#### 4. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type VARCHAR(20) NOT NULL, -- 'earning', 'withdrawal', 'bonus', 'penalty', 'refund'
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  
  -- Related Entities
  submission_id UUID REFERENCES submissions(id),
  withdrawal_id UUID REFERENCES withdrawals(id),
  
  -- Metadata
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('earning', 'withdrawal', 'bonus', 'penalty', 'refund'))
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### 5. Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Withdrawal Details
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL, -- 'paypal', 'bank_transfer', 'crypto_usdc'
  account_details JSONB NOT NULL, -- Encrypted account info
  /*
    Example:
    PayPal: { "email": "user@example.com" }
    Bank: { "account_name": "...", "account_number": "encrypted", "routing": "encrypted" }
    Crypto: { "wallet_address": "0x..." }
  */
  
  -- Processing
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected', 'cancelled'
  processed_by UUID REFERENCES users(id), -- Admin who processed
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Transaction Reference
  external_transaction_id VARCHAR(255), -- PayPal/Bank reference
  
  -- Rejection
  rejection_reason TEXT,
  
  -- Metadata
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_method CHECK (method IN ('paypal', 'bank_transfer', 'crypto_usdc')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  CONSTRAINT min_withdrawal CHECK (amount >= 5.00)
);

-- Indexes
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON withdrawals(requested_at);
```

#### 6. Achievements Table
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Material Icon name
  
  -- Unlock Criteria
  criteria_type VARCHAR(50), -- 'tasks_completed', 'earnings_total', 'streak_days', 'trust_score'
  criteria_threshold INTEGER,
  
  -- Rewards
  xp_bonus INTEGER DEFAULT 0,
  badge_color VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, achievement_id)
);
```

#### 7. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'task_completion', 'withdrawal_processed', 'achievement_unlocked', 'admin_message'
  
  -- Navigation
  action_url VARCHAR(255), -- Deep link: "/tasks/123" or "/wallet"
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_type CHECK (type IN ('task_completion', 'withdrawal_processed', 'achievement_unlocked', 'admin_message', 'system_update'))
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## 🔐 Authentication & Authorization

### Supabase Auth Integration

```javascript
// User Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'contributor'
    }
  }
});

// User Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://xum-ai.app/auth/callback'
  }
});
```

### Row Level Security (RLS) Policies

```sql
-- Users: Can only read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Tasks: Anyone can view active tasks, only creators/admins can modify
CREATE POLICY "Anyone can view active tasks" ON tasks
  FOR SELECT USING (status = 'active');

CREATE POLICY "Task creators can update" ON tasks
  FOR UPDATE USING (auth.uid() = created_by OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Submissions: Users can only view/create their own
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals: Users can only view/create their own
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id AND (SELECT balance FROM users WHERE id = user_id) >= amount);
```

---

## 📡 API Endpoints

### Authentication Endpoints

```
POST   /auth/signup
Body:  { email, password, full_name, role }
Response: { user, session }

POST   /auth/login
Body:  { email, password }
Response: { user, session }

POST   /auth/forgot-password
Body:  { email }
Response: { message: "Reset link sent" }

POST   /auth/verify-otp
Body:  { email, otp }
Response: { message: "Email verified" }

POST   /auth/logout
Response: { message: "Logged out" }
```

### User Endpoints

```
GET    /api/v1/users/me
Response: { user object }

PUT    /api/v1/users/me
Body:  { full_name, bio, location, avatar_url }
Response: { updated user }

GET    /api/v1/users/:id/stats
Response: { tasks_completed, accuracy, streak_days, total_earned }
```

### Task Endpoints

```
GET    /api/v1/tasks
Query: ?type=audio&difficulty=medium&min_reward=5&max_reward=20
Response: { tasks: [...], total_count }

GET    /api/v1/tasks/:id
Response: { task object with full details }

POST   /api/v1/tasks (Company/Admin only)
Body:  { title, description, task_type, reward, ... }
Response: { created task }

PUT    /api/v1/tasks/:id (Creator/Admin only)
Body:  { status: 'paused' }
Response: { updated task }

DELETE /api/v1/tasks/:id (Admin only)
Response: { message: "Task deleted" }
```

### Submission Endpoints

```
POST   /api/v1/submissions
Body:  { task_id, submission_data, time_spent_seconds }
Response: { submission, reward_earned, xp_earned }

GET    /api/v1/submissions/me
Query: ?status=approved&limit=20&offset=0
Response: { submissions: [...], total_count }

GET    /api/v1/submissions/:id
Response: { submission object }

PUT    /api/v1/submissions/:id/review (Admin only)
Body:  { status: 'approved', quality_score: 0.95, admin_notes }
Response: { updated submission }
```

### Withdrawal Endpoints

```
POST   /api/v1/withdrawals
Body:  { amount, method, account_details }
Response: { withdrawal object }

GET    /api/v1/withdrawals/me
Response: { withdrawals: [...] }

PUT    /api/v1/withdrawals/:id/process (Admin only)
Body:  { status: 'completed', external_transaction_id }
Response: { updated withdrawal }
```

### Admin Endpoints

```
GET    /api/v1/admin/dashboard
Response: { pending_reviews, active_users, flagged_tasks, pending_payouts }

GET    /api/v1/admin/users
Query: ?status=active&search=john
Response: { users: [...], total_count }

PUT    /api/v1/admin/users/:id/status
Body:  { is_active: false, reason: "Policy violation" }
Response: { updated user }

GET    /api/v1/admin/submissions?status=pending
Response: { submissions: [...] }

POST   /api/v1/admin/payouts/batch-approve
Body:  { withdrawal_ids: [...] }
Response: { processed_count }
```

---

## ⚙️ Business Logic

### Task Distribution Algorithm

```sql
-- Prioritized Task Feed Function
CREATE OR REPLACE FUNCTION get_user_task_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  task_id UUID,
  title VARCHAR,
  reward DECIMAL,
  priority_score DECIMAL
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.reward,
    (
      CASE WHEN t.is_priority THEN 10 ELSE 0 END +
      (10 - (t.current_submissions::DECIMAL / NULLIF(t.max_submissions, 0) * 10)) +
      (t.reward / 10)
    ) AS priority_score
  FROM tasks t
  INNER JOIN users u ON u.id = p_user_id
  WHERE t.status = 'active'
    AND t.current_submissions < t.max_submissions
    AND u.trust_score >= t.min_trust_score
    AND u.level >= t.min_level
    AND (t.deadline IS NULL OR t.deadline > now())
  ORDER BY priority_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### Submission Validation

```javascript
// Tier 1: Automated Validation
async function autoValidateSubmission(submission) {
  const { task_type, submission_data } = submission;
  
  switch(task_type) {
    case 'audio':
      // Check audio duration (min 5s, max 2min)
      if (submission_data.duration < 5 || submission_data.duration > 120) {
        return { valid: false, reason: 'Invalid audio duration' };
      }
      // Run AI quality check (noise level, clarity)
      const audioQuality = await checkAudioQuality(submission_data.audio_url);
      if (audioQuality < 0.7) {
        return { valid: false, reason: 'Low audio quality' };
      }
      break;
      
    case 'text':
      // Check for gibberish
      const isValidText = await validateTextContent(submission_data.text_content);
      if (!isValidText) {
        return { valid: false, reason: 'Invalid text content' };
      }
      break;
  }
  
  return { valid: true };
}

// Tier 2: Consensus Validation
async function consensusValidate(taskId) {
  const submissions = await supabase
    .from('submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('status', 'pending')
    .limit(3);
    
  if (submissions.length < 3) return; // Wait for more submissions
  
  // Compare submission similarity
  const similarity = compareSubmissions(submissions);
  
  if (similarity > 0.7) {
    // 70% agreement → auto-approve
    await approveSubmissions(submissions.map(s => s.id));
  } else {
    // Low consensus → flag for human review
    await flagForReview(submissions.map(s => s.id), 'Low consensus');
  }
}
```

### Financial Integrity

```sql
-- Atomic Balance Update Function
CREATE OR REPLACE FUNCTION process_task_reward(
  p_user_id UUID,
  p_submission_id UUID,
  p_reward DECIMAL
)
RETURNS BOOLEAN
AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Update user balance
  UPDATE users
  SET 
    balance = balance + p_reward,
    total_earned = total_earned + p_reward,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
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
  SET status = 'approved', reviewed_at = now()
  WHERE id = p_submission_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### Withdrawal Escrow

```sql
-- Withdrawal Request with Balance Lock
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
BEGIN
  -- Check balance
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE; -- Lock row
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct balance immediately
  UPDATE users
  SET balance = balance - p_amount
  WHERE id = p_user_id;
  
  -- Create withdrawal record
  INSERT INTO withdrawals (user_id, amount, method, account_details)
  VALUES (p_user_id, p_amount, p_method, p_account_details)
  RETURNING id INTO v_withdrawal_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, balance_after, withdrawal_id, description)
  VALUES (
    p_user_id,
    'withdrawal',
    -p_amount,
    v_current_balance - p_amount,
    v_withdrawal_id,
    'Withdrawal request'
  );
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Analytics & Monitoring

### Key Metrics Tracking

```sql
-- Platform Health Dashboard
CREATE VIEW admin_dashboard_metrics AS
SELECT
  (SELECT COUNT(*) FROM users WHERE is_active = true) AS active_users,
  (SELECT COUNT(*) FROM tasks WHERE status = 'active') AS active_tasks,
  (SELECT COUNT(*) FROM submissions WHERE status = 'pending') AS pending_reviews,
  (SELECT SUM(amount) FROM withdrawals WHERE status = 'pending') AS pending_payouts,
  (SELECT COUNT(*) FROM submissions WHERE is_flagged = true) AS flagged_submissions,
  (SELECT AVG(trust_score) FROM users WHERE role = 'contributor') AS avg_trust_score,
  (SELECT SUM(balance) FROM users) AS total_platform_liability;

-- User Activity Tracking
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100), -- 'login', 'task_view', 'task_accept', 'submission_submit'
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_action ON user_activity_logs(action);
```

### Fraud Detection

```sql
-- Detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE (
  user_id UUID,
  issue VARCHAR,
  details TEXT
)
AS $$
BEGIN
  -- Rapid submissions (>10 in 1 hour)
  RETURN QUERY
  SELECT 
    s.user_id,
    'Rapid submissions'::VARCHAR,
    'Submitted ' || COUNT(*) || ' tasks in 1 hour'
  FROM submissions s
  WHERE s.submitted_at > now() - INTERVAL '1 hour'
  GROUP BY s.user_id
  HAVING COUNT(*) > 10;
  
  -- Low approval rate (<50%)
  RETURN QUERY
  SELECT
    u.id,
    'Low approval rate'::VARCHAR,
    'Only ' || ROUND((approved::DECIMAL / NULLIF(total, 0) * 100), 2) || '% approved'
  FROM users u
  CROSS JOIN LATERAL (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'approved') AS approved
    FROM submissions
    WHERE user_id = u.id
  ) s
  WHERE total > 10 AND approved::DECIMAL / total < 0.5;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Background Jobs & Cron

### Scheduled Tasks (Supabase Functions)

```javascript
// Daily XP Decay (encourage regular activity)
export async function dailyXPDecay() {
  await supabase.rpc('decay_inactive_users', {
    inactivity_days: 7,
    decay_percentage: 0.05 // 5% XP loss
  });
}

// Weekly Analytics Report
export async function weeklyAnalyticsReport() {
  const metrics = await supabase.from('admin_dashboard_metrics').select('*');
  await sendAdminEmail('Weekly Platform Report', metrics);
}

// Automatic Payout Processing
export async function processAutoApprovedPayouts() {
  const eligiblePayouts = await supabase
    .from('withdrawals')
    .select('*')
    .eq('status', 'pending')
    .gte('requested_at', 'now() - INTERVAL 3 days')
    .from('users')
    .gte('trust_score', 8.0); // High trust users
    
  for (const payout of eligiblePayouts) {
    await processPaypalPayout(payout);
  }
}
```

---

## 🚀 Scalability Considerations

### Database Optimization

1. **Indexing Strategy**:
   - Index frequently queried columns (user_id, task_type, status)
   - Composite indexes for complex queries
   - Partial indexes for filtered queries

2. **Partitioning**:
   - Partition `submissions` table by date (monthly)
   - Archive old transactions after 1 year

3. **Caching**:
   - Redis for active task pools (60s TTL)
   - Cache user profiles (5 minutes)

### Horizontal Scaling

- **Read Replicas**: For analytics queries
- **Connection Pooling**: PgBouncer for database connections
- **CDN**: CloudFlare for static assets and media files

---

**Last Updated**: December 30, 2025  
**Backend Architect**: XUM AI Infrastructure Team  
**Version**: 1.0
