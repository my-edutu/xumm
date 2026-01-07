# XUM AI - API Architecture & Documentation

This document outlines the API ecosystem of XUM AI, differentiating between functioning endpoints/services and those requiring further development or refinement based on the [PRD](../doc/xum%20PRD.md).

---

## 🔐 1. Authentication & Security (AUTH)
*Powered by Supabase Auth + Custom Triggers*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `supabase.auth.signUp()` | **Functioning** | Basic email/password registration. |
| `supabase.auth.signIn()` | **Functioning** | Session initialization. |
| `on_auth_user_created()` | **Functioning** | Database trigger creating `profiles` and `wallets` on signup. |
| `rbac_check()` | **Functioning** | Role-based access control via `profiles.role` column. |
| **OAuth (Google/Apple)** | **Mediocre** | Auth screens have buttons, but provider configuration needs finalization in Supabase. |

---

## 👤 2. Contributor Management (USER)
*Internal Database Procedures & Client Wrappers*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `get_user_profile` | **Functioning** | Fetches avatar, bio, languages, and skills. |
| `get_user_stats` | **Functioning** | Aggregates tasks completed, accuracy, and total earned. |
| `update_user_skills` | **Functioning** | Updates skill and language arrays in profile. |
| `calculate_accuracy` | **Functioning** | Trigger-based calculation of user performance. |

---

## 📋 3. Task Lifecycle (TASK)
*Core Task Management System*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `fetch_active_tasks` | **Functioning** | Returns tasks filtered by status and user eligibility. |
| `create_task_entry` | **Functioning** | Admin-panel API to initialize new task protocols. |
| `get_task_details` | **Functioning** | Detailed fetch for specific task instructions and metadata. |
| **Task Assignment** | **Missing** | Formal direct assignment (e.g., "Assign Task X to User Y") is not yet implemented; it's currently a pull-based feed. |

---

## 📤 4. Submission & Pipeline (SUBMISSION)
*Data Ingestion Engine*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `submit_payload` | **Functioning** | High-concurrency intake for text, audio, and image labels. |
| `s3_upload_proxy` | **Functioning** | Direct-to-S3 (Hetzner) upload flow for heavy media (video/audio). |
| `validate_submission` | **Functioning** | Basic status update (Pending -> Approved/Rejected). |

---

## 🧠 5. Linguasense & Validation (ENGINE)
*Advanced Consensus & AI Orchestration*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `consensus_agreement` | **Functioning** | Weighted consensus logic for local language grounding. |
| `prompt_factory` | **Functioning** | Dynamic prompt generation for LLM-assisted dataset creation. |
| **Gold Check Service** | **Missing** | Automated "traps" (known-answer tasks) to verify user intent are not yet systematized. |
| **Consensus API Key** | **Functioning** | Secure access to the synthesis engine via `linguasence_api_keys`. |

---

## 💰 6. Wallet & Financials (PAYMENT)
*Ledger system with full audit trail*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `process_task_reward` | **Functioning** | Real-time balance update and transaction logging on task approval. |
| `request_withdrawal` | **Functioning** | Submits payout request to the admin queue. |
| `process_payout` | **Functioning** | Admin-side fulfillment of withdrawal requests. |
| **Paystack Integration** | **Mediocre** | Webhooks and direct payout automation are in "Handshake/Mock" state. |

---

## 🏆 7. Gamification & Retention (GROWTH)
*Engagement Hooks*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `get_leaderboard` | **Functioning** | Global and country-based rankings by earnings or XP. |
| `award_badge` | **Functioning** | Logic to grant achievements based on milestones. |
| `check_streaks` | **Functioning** | Daily activity tracker and bonus multiplier. |

---

## 🏢 8. Enterprise Dashboard (COMPANY)
*B2B Management APIs*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `purchase_dataset` | **Functioning** | Deducts funds from company wallet to unlock dataset access. |
| `export_data_parquet` | **Functioning** | Service to bundle data into enterprise formats. |
| **Campaign Analytics** | **Mediocre** | Dashboards exist but lack deep drill-down metrics (e.g., ROI per task type). |
| **Budget Top-up** | **Mediocre** | Currently manual; requires payment gateway flow for automate credits. |

---

## 🛠 9. Administrative Control (ADMIN)
*Platform Governance*

| API / Endpoint | State | Description |
| :--- | :--- | :--- |
| `flag_fraudulent_user` | **Functioning** | Manual and automated tagging of suspicious activity. |
| `review_all_submissions`| **Functioning** | Multi-tenant view of the entire contribution pipeline. |
| `system_audit_log` | **Functioning** | Immutable trail of all high-privilege actions. |

---

## 🔌 10. External Infrastructure
*Third-party Connectivity*

| Provider | Purpose | State |
| :--- | :--- | :--- |
| **Hetzner S3** | Media Storage | **Functioning** |
| **Supabase DB** | Data Lake | **Functioning** |
| **Paystack** | Financial Off-ramp | **Mediocre** |
| **Google Play** | Distribution | **Not Started** |

---

## 🚀 Prioritized API Development Plan

### 🔴 High Priority (Immediate Impact)
1.  **Gold Check Service**: Implement automated "trap" submissions with known answers to filter out bots and low-quality workers.
2.  **Payment Gateway Completion**: Transition from mock Paystack flows to real-world webhook handling for automated withdrawals.
3.  **Individual Task Assignment**: Develop the logic for "Targeted Tasks" where specific users are assigned priority missions based on their Accuracy Score.

### 🟡 Medium Priority (Scalability)
1.  **Advanced Company Analytics**: Move beyond total counts to provide companies with visibility into "Quality over Time" and "Demographic distribution" of their labels.
2.  **Automated Dispute Resolution**: An API for users to appeal rejected submissions, with a second-layer "Master Validator" review.
3.  **Real-time Webhooks**: Allow enterprise clients to receive real-time POST requests when a dataset batch is completed (Consensus reached).

### 🟢 Low Priority (Optimization)
1.  **Rater Agreement Metrics**: Detailed breakdown of how often a user agrees with the consensus, used for "Expert" level qualifying.
2.  **Referral Rewards Engine**: API-driven balance top-ups for users who bring in high-quality contributors.
3.  **Social Community Feed**: API to fetch "Success Stories" and "Top Challenges" for the leaderboard social layer.

---

### Legend
- **Functioning**: Completed, tested, and integrated into UI.
- **Mediocre**: Basic logic exists but requires refinement, final configuration, or more robust error handling.
- **Missing**: Not yet implemented or in early conceptual stage.
- **Not Started**: Scheduled for later phases.
