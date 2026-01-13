
# XUM AI: Technical Implementation Guide
**Architectural Blueprint for Functional Systems**

## 1. Task Discovery & Feed System (The "Feeds")
To ensure users always have relevant tasks, we implement a **Prioritized Feed Engine**:
*   **Logic**: Instead of a flat list, the `GET /api/v1/tasks` endpoint filters by `user.trust_score` and `user.node_level`.
*   **Ranking**: Tasks with the highest `priority` and nearest `max_submissions` cap are pushed to the top.
*   **Caching**: We use Redis to store "Active Task Pools" for 60 seconds to prevent heavy SQL JOINs on every app refresh.

## 2. Accreditation & Validation Loop (The "Monitor")
This is the "Brain" that manages the flow from user input to payment:
1.  **Ingestion**: User POSTs a submission. Status defaults to `pending`.
2.  **Auto-Validation (Tier 1)**: For surveys, we check for "gibberish" using regex or a small LLM pass. If found, status = `rejected`.
3.  **Consensus Check (Tier 2)**: The system waits for 3 users to complete the same task. If answers align (e.g., 2/3 agree), the task is marked `approved`.
4.  **Manual Audit (Tier 3)**: High-reward tasks are flagged for human admins in the `Admin Ops` panel.

## 3. Financial Integrity (The "Wallet")
*   **Atomic Transactions**: Balance updates MUST happen inside a SQL Transaction.
    ```sql
    BEGIN;
    UPDATE users SET balance = balance + reward WHERE id = user_id;
    INSERT INTO transactions ...;
    COMMIT;
    ```
*   **Withdrawal Escrow**: When a user requests a withdrawal, the funds are moved to a `pending_payout` state in the ledger until the admin clears the batch.

## 4. Monitoring Strategy
*   **Throughput**: Monitoring "Submissions per Minute" to detect bot farms.
*   **Accuracy Drift**: If a user's approval rate drops below 85%, the system automatically "de-accredits" them, hiding high-paying tasks.
*   **SLA Tracking**: For Enterprise clients, we monitor "Time to Complete" to ensure projects finish on schedule.

## 5. Implementation Steps
1.  **Connect Supabase/PostgreSQL**: Apply `task.sql` to your database.
2.  **API Layer**: Build Node.js (Express) or Go endpoints for `/tasks` and `/submissions`.
3.  **Auth Integration**: Use JWT tokens to secure user identity in every contribution.
4.  **Admin UI**: Connect the `AdminScreens.tsx` components to the `submissions` table filtered by `status = pending`.
