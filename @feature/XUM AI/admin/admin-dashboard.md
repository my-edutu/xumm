# Feature: Internal Admin Terminal

## 📝 The Journey
Even in a decentralized system, moderation is mandatory. I built an "Admin Layer" directly into the user app, accessible only to users with the `admin` role. This allows our team to manage the network while eating our own dog food.

### Engineering Decisions
- **Segregated KPIs**: The Admin Dashboard provides high-level metrics (Total Nodes, Active Tasks, Pending Liquidity) using a dark, analytical UI.
- **Node Search (User Management)**: A fast search interface to look up any contributor by their ID or name, with a status toggle to "suspend" or "verify" nodes.
- **Moderation Queue**: A specialized view for reviewing sensitive submissions (video/audio) before they are finalized for the client.
- **Payout Authorization**: A final safety gate for withdrawals, allowing an admin to review and "Sign" a payout before the funds move.

## 💻 Implementation Details
- **File**: `user-app/screens/AdminScreens.tsx`
- **Components**: `AdminDashboardScreen`, `UserManagementScreen`, `TaskModerationScreen`.

### Admin Capabilities
- **Overview**: Real-time ticker of network activity.
- **Moderation**: Quality control interface for task submissions.
- **Finance**: Manual override and approval of network payouts.

## 🧪 Verification
- [x] Admin screens only toggle-able via specific logic (`ScreenName`).
- [x] Search input filters the user list correctly.
- [x] Stat cards in Admin view use different icons (`group`, `fact_check`, `account_balance`) to denote authority.
