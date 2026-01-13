# XUM AI Database Migration Guide

This guide provides step-by-step instructions for setting up the complete XUM AI database schema in Supabase.

## Migration Files Overview

| File | Purpose | Dependencies |
|------|---------|--------------|
| `000_repair_columns.sql` | Adds missing columns to existing tables | None |
| `001_core_schema.sql` | Core tables: Users, Companies, Tasks, Wallets | None |
| `002_auth_triggers.sql` | Auto-creates user profile on signup | 001 |
| `003_rls_policies.sql` | Row Level Security for multi-tenancy | 001 |
| `004_business_logic.sql` | RPCs for analytics and reward processing | 001 |
| `005_views.sql` | Analytics views for dashboards | 001 |
| `006_workflow.sql` | Company → Admin → Worker pipeline | 001, 005 |
| `007_admin_dashboard.sql` | Admin Panel tables, views, and metrics | 001, 006 |

## Application Order

Run these in Supabase SQL Editor in this exact order:

### Phase 1: Core Infrastructure
```
1. 000_repair_columns.sql  (if upgrading existing database)
2. 001_core_schema.sql
3. 002_auth_triggers.sql
4. 003_rls_policies.sql
```

### Phase 2: Business Logic
```
5. 004_business_logic.sql
6. 005_views.sql
7. 006_workflow.sql
```

### Phase 3: Admin Features
```
8. 007_admin_dashboard.sql
```

## What Each File Creates

### 001_core_schema.sql
- `users` - All platform users (workers, companies, admins)
- `companies` - Company profiles
- `company_wallets` - Company treasury/balance
- `tasks` - Projects/workspaces
- `submissions` - Worker contributions
- `financial_ledger` - Transaction history
- `billing_requests` - Deposit requests
- `notifications` - System messages

### 006_workflow.sql - Business Flow Functions
| Function | Used By | Purpose |
|----------|---------|---------|
| `submit_project_for_review()` | Company Portal | Submit new project |
| `admin_approve_project()` | Admin Panel | Approve & lock funds in escrow |
| `admin_reject_project()` | Admin Panel | Reject with reason |
| `worker_submit_task()` | Users App | Submit work |
| `approve_submission_and_pay()` | Admin Panel | Pay worker |

### 007_admin_dashboard.sql - Admin Panel Support
**New Tables:**
- `worker_payout_queue` - Pending worker payments
- `escrow_ledger` - Locked project funds
- `support_tickets` - Help requests
- `rating_appeals` - Quality disputes
- `flagged_submissions` - Fraud/quality flags

**New Views (Auto-updating stats):**
- `admin_dashboard_stats` - Powers Overview cards
- `admin_action_center` - Control module counts
- `admin_submission_quality` - Pie chart data
- `admin_task_governance` - Task management table

## Frontend Integration Examples

### Fetch Dashboard Stats (Admin)
```typescript
const { data } = await supabase.from('admin_dashboard_stats').select('*').single();
// Returns: engine_load_percent, monthly_throughput, accuracy_percent, etc.
```

### Company Submits Project
```typescript
await supabase.rpc('submit_project_for_review', {
  p_company_id: companyId,
  p_title: 'Voice Data Project',
  p_description: 'Collect 5000 voice samples',
  p_task_type: 'audio',
  p_target_submissions: 5000,
  p_reward_per_item: 0.10
});
```

### Admin Approves Project
```typescript
await supabase.rpc('admin_approve_project', {
  p_admin_id: adminId,
  p_task_id: taskId,
  p_final_reward: 0.12 // Optional override
});
```

## Troubleshooting

### UUID Type Errors
If you see `operator does not exist: uuid = text`, ensure you're using the latest `003_rls_policies.sql` which casts all comparisons to text.

### Missing Column Errors
Run `000_repair_columns.sql` to add any missing columns to existing tables.

### RLS Blocking Data
1. Check user is logged in
2. Verify user's role in `public.users`
3. For admin access, set `role = 'admin'`

