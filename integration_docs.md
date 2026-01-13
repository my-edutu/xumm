# XUM AI Integration & Recommendations

This document outlines the API structure and logic flow required to connect your frontend to the SQL schema provided.

## 1. Authentication & Company Mapping
When a user signs up via Clerk, your backend (or Supabase Edge Function) should:
1.  **Check** if a `company` record exists for the user's `auth.uid()`.
2.  **Redirect** to the onboarding flow if it's a new login to capture the `company_name`.
3.  **Consistency**: Every API request should include the `company_id` to ensure users only ever see their own data.

## 2. Real-Time Balance Synchronization
To ensure the "Available Balance" is never mock data:
*   **API Recommendation**: Use Supabase Realtime (WebSockets) to listen to changes on the `companies` table.
*   **Trigger**: Create a database trigger that updates the company's `balance` whenever a `transaction` of type `deposit` is marked as `completed`.

## 3. Dataset Submission & Review Flow (The Admin Loop)
This is the most critical workflow for your business:
1.  **Submission**: Company submits a `dataset` with their `bid_per_item`. Status is `pending_review`.
2.  **Admin Discovery**: Admin Panel fetches all datasets where `status = 'pending_review'`.
3.  **Review Logic**:
    *   Admin inspects the data samples.
    *   Admin updates `final_price_per_item` based on internal logic.
    *   Admin sets status to `approved`.
4.  **Company Feedback**: Company receives a notification: "Your project [Name] has been approved at $[Price]/item."

## 4. Simplified Language Dictionary
To keep users engaged, we have simplified technical terms:
| Old Technical Term | New Simple Term |
| :--- | :--- |
| Core Metrics | Main Statistics |
| Platform Pulse | Live Updates |
| Executive Dashboard | Overview Dashboard |
| Workforce Intelligence | Worker Network |
| Matrix Intel | System Information |
| Ledger / Billing | Treasury |

## 5. Recommended API Endpoints
If building a custom Node/Next.js backend:
*   `GET /api/company/stats`: Returns balance, active job count, and notification count.
*   `POST /api/projects/submit`: Submits new dataset for admin review.
*   `GET /api/notifications`: Returns last 10 messages from admin.
*   `POST /api/treasury/deposit`: Initiates a payment (Stripe/Paystack).

---
*Follow these recommendations to ensure the platform remains consistent as you scale from 1 to 1000 companies.*
