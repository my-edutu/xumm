# XUM AI - Technical API Reference (RPCs & Functions)

This document lists the specific Supabase RPCs, database functions, and Edge Functions currently implemented in the XUM AI ecosystem.

## 🗄️ Database RPCs (Remote Procedure Calls)

### User & Economy
| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `process_task_reward` | `p_user_id`, `p_submission_id`, `p_reward`, `p_xp` | `void` | Validates a submission and updates user balance/XP. |
| `get_user_rankings` | `p_limit`, `p_country` | `setof record` | Fetches leaderboard data. |
| `calculate_user_accuracy` | `p_user_id` | `numeric` | Computes accuracy based on approved vs. total submissions. |

### Tasks & Submissions
| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `verify_linguasence_submission` | `p_submission_id` | `boolean` | Triggers weighted consensus logic for linguistic data. |
| `get_eligible_tasks` | `p_user_id` | `setof tasks` | Returns tasks matching user skills and location. |
| `flag_submission_fraud` | `p_submission_id`, `p_reason` | `void` | Appends a fraud flag to a specific entry. |

### Dataset & Marketplace
| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `purchase_dataset_batch` | `p_company_id`, `p_batch_id` | `jsonb` | Atomic transaction to unlock data for a company. |
| `package_dataset_metadata` | `p_project_id` | `jsonb` | Aggregates stats for dataset serialization. |

---

## ⚡ Edge Functions (TypeScript)
*Located in `/supabase/functions/`*

### `storage-manager`
- **Method**: `POST`
- **Description**: Handles signed URL generation for heavy media uploads to Hetzner S3.
- **State**: **Functioning**

### `package-dataset`
- **Method**: `POST`
- **Description**: Compiles multiple submissions into a single Parquet/JSON file for download.
- **State**: **Mediocre** (Needs better compression logic).

### `process-payment`
- **Method**: `POST`
- **Description**: Paystack webhook listener for company wallet top-ups.
- **State**: **Mediocre** (Handshake logic implemented, verification pending).

### `deliver-webhook`
- **Method**: `POST`
- **Description**: Dispatches real-time updates to external enterprise URLs.
- **State**: **Missing/Draft**

---

## 🔐 Security Policies (RLS)
The following tables have restricted access via Row Level Security:
- `profiles`: Users can only read their own (except for leaderboards).
- `submissions`: Users can only see their own submissions.
- `wallets`: Users can only see their own balance.
- `tasks`: Read-only for contributors, write-access for admins/companies.
- `audit_logs`: Restricted to `service_role` and super-admins.
