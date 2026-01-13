# XUM AI Platform - Supabase Setup Guide

## 🚀 Quick Start Checklist

Follow these steps **in order** to set up your Supabase backend.

---

## Step 1: Run the Core SQL Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/00_complete_setup.sql`
5. Paste and click **Run**

✅ This creates:
- All core tables (users, tasks, submissions, transactions, withdrawals, notifications)
- Auth trigger (auto-creates user profile on signup)
- RLS policies (security rules)
- Core business logic functions
- Platform settings

---

## Step 2: Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add User** → **Create New User**
3. Enter email and password for admin
4. Go back to **SQL Editor** and run:

```sql
-- Replace 'admin@yourcompany.com' with the email you used
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@yourcompany.com';
```

✅ Now this user has full admin access across all apps.

---

## Step 3: Get Your API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

---

## Step 4: Configure Your Apps

Create `.env.local` files in each app folder:

### XUM AI (User App) - `XUM AI/.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Company Portal - `company/.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Admin Panel - `Admin Panel/.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 5: Disable Prototype Mode (When Ready)

The User App currently runs in **prototype mode** (no auth required). 
To enable real authentication:

### A. Restore UserContext.tsx
Replace the mocked version with the original Supabase version.

### B. Restore App.tsx auth logic
Uncomment the auth enforcement in the useEffect hook.

---

## 📊 Core Functions Explained

### For User App (Contributors)

| Function | Purpose |
|----------|---------|
| `get_user_task_feed(user_id)` | Returns personalized tasks based on user level & trust score |
| `process_task_reward(user_id, submission_id)` | Processes approved submission: adds balance, XP, handles level-up |
| `request_withdrawal(user_id, amount, method, details)` | Creates withdrawal request, deducts from balance |

### For Company Portal

| Function | Purpose |
|----------|---------|
| `INSERT INTO tasks` | Create new data collection tasks |
| `SELECT * FROM submissions WHERE task_id = ?` | View submissions for their tasks |
| `get_task_submissions_for_company(task_id)` | Anonymized worker submissions |

### For Admin Panel

| Function | Purpose |
|----------|---------|
| Full access to all tables | Admins bypass most RLS policies |
| `UPDATE users SET role = 'company'` | Promote users to company role |
| `UPDATE withdrawals SET status = 'completed'` | Process withdrawal requests |
| `platform_settings` table | Control maintenance mode, announcements |

---

## 🔄 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPANY creates TASK ──────────────────────────────────────┐   │
│       │                                                      │   │
│       ▼                                                      ▼   │
│  USER sees TASK in marketplace                          ADMIN    │
│       │                                                monitors  │
│       ▼                                                  all     │
│  USER submits WORK (creates SUBMISSION)                          │
│       │                                                          │
│       ▼                                                          │
│  SYSTEM auto-approves (or ADMIN reviews)                         │
│       │                                                          │
│       ▼                                                          │
│  USER receives REWARD (balance + XP)                             │
│       │                                                          │
│       ▼                                                          │
│  USER requests WITHDRAWAL                                        │
│       │                                                          │
│       ▼                                                          │
│  ADMIN processes WITHDRAWAL                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Troubleshooting

### "relation does not exist" error
Run the SQL setup script again - some tables may have failed.

### "permission denied" error
Check that RLS policies are created. Run:
```sql
SELECT * FROM pg_policies;
```

### User not created after signup
Check the auth trigger exists:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

---

## 🔒 Security Notes

1. **Never expose service_role key** in frontend code
2. **All financial operations** use server-side validation
3. **RLS policies** ensure users can only access their own data
4. **Admins** have full access but actions are audit-logged

---

## 📁 Optional: Run Additional Migrations

After the core setup works, you can add advanced features:

```
12_linguasence_engine.sql     → Language learning tasks
14_analytics_schema.sql       → Advanced analytics
15_secure_marketplace_bridge.sql → Data asset marketplace
16_payment_infrastructure_v2.sql → Multi-wallet support
```

Run these one at a time and test after each.
