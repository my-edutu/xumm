# Supabase Migrations

This folder contains SQL migrations for the XUM AI database schema.

## Migration Files

| File | Description |
|------|-------------|
| `001_featured_tasks.sql` | Featured promo cards on home screen |
| `002_capture_prompts.sql` | Voice, image, and video task prompts |
| `003_task_submissions.sql` | User task submissions and rewards |
| `004_leaderboard.sql` | User rankings and leaderboard views |
| `005_admin_tasks.sql` | Daily Missions & XUM Judge tasks |
| `006_wallet_withdrawals.sql` | Transactions and withdrawal requests |
| `007_user_records.sql` | User activity logs and daily stats |
| `008_storage_and_task_functions.sql` | Storage policies and task review functions |

## How to Apply Migrations

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order (001, 002, 003...)
4. Click **Run** to execute

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Tables Overview

### `featured_tasks`
Admin-controlled promo cards displayed on the home screen.

**Key columns:**
- `title` - Card title
- `subtitle` - Short description
- `badge_text` - Badge label (e.g., "EARN REWARDS")
- `gradient_start/end` - Card background colors (hex)
- `icon_name` - MaterialIcons icon name
- `target_screen` - Navigation destination
- `display_order` - Card ordering
- `is_active` - Toggle visibility

### `capture_prompts`
Task prompts shown to users during voice, image, and video capture.

**Key columns:**
- `task_type` - voice, image, or video
- `prompt_text` - The instruction to display
- `category` - Prompt category for UI badge
- `hint_text` - Helper text below prompt
- `base_reward` - Payment for completion
- `bonus_reward` - Extra for translation/description
- `language_code` - Optional language targeting
- `is_active` - Toggle availability

### `task_submissions`
Tracks all user task completions for review and payment.

**Key columns:**
- `user_id` - Submitting user
- `prompt_id` - Which prompt was completed
- `file_url` - Media file storage URL
- `translation_text` - Bonus content
- `status` - pending, approved, rejected, reviewing
- `total_reward` - Auto-calculated reward
- `session_id` - Groups 5 tasks together

## RLS Policies

All tables have Row Level Security enabled:

- **Featured Tasks**: Public read, admin write
- **Capture Prompts**: Public read, admin write
- **Task Submissions**: User read/write own, admin full access

## Admin Functions

```sql
-- Get random prompts for a user
SELECT * FROM get_random_prompts('voice'::capture_task_type, 'user-uuid', 5);

-- Get user earnings summary
SELECT * FROM get_user_earnings('user-uuid');
```

## Adding New Prompts (Admin)

```sql
INSERT INTO capture_prompts (task_type, prompt_text, category, hint_text, base_reward)
VALUES ('voice', 'Your new prompt here', 'Category', 'Hint text', 0.25);
```

## Adding New Featured Cards (Admin)

```sql
INSERT INTO featured_tasks (title, subtitle, badge_text, gradient_start, gradient_end, icon_name, target_screen, display_order)
VALUES ('New Feature', 'Description here', 'NEW', '#ff6b6b', '#ee5253', 'star', 'TARGET_SCREEN', 3);
```
