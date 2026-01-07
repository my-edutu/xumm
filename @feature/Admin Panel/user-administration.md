# Feature: Node & User Administration

## 📝 The Journey
Managing thousands of anonymous contributors requires a high-density UI. I built the `UserManagement` module to allow admins to vet, promote, or suspend "Nodes" (users) with surgical precision.

### Engineering Decisions
- **High-Density Data Grid**: A table-first approach showing ID, Reputation, Total Earnings, and Verification Status.
- **Reputation Logic**: Integrated a visual score (XP) and "Success Rate" to help admins identify elite workers for high-priority RLHF tasks.
- **Instant Suspension Protocol**: A "One-Click" suspension feature for catching bad actors, which immediately invalidates the node's session in the user app.
- **Audit Trace**: (Integration in progress) Every admin action on a user is logged to a secure `admin_actions` table for compliance.

## 💻 Implementation Details
- **File**: `admin-panel/src/App.tsx`
- **Component**: `UserManagement()`.

### Management Actions
- **Tier Promotion**: Moving a user to "Elite" or "Linguasense" status.
- **Withdrawal Freeze**: pausing a user's ability to request liquidity.
- **Identity Verification**: Approving KYC or account details.

## 🧪 Verification
- [x] User search filters the dataset by ID, Email, or Name.
- [x] Verification badges (Emerald checkmarks) appear only for verified nodes.
- [x] Status toggles update the backend `users` table via Supabase client.
