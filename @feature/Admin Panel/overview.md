# Feature: Admin Command Center (Master Overview)

## 📝 The Journey
The Admin Overview is the "Eye of Sauron" for the XUM AI ecosystem. I designed it to provide total visibility into both the user and company sides of the network, with real-time load balancing stats.

### Engineering Decisions
- **Multi-Vector Stat Indicators**: Used `StatIndicator` components to track four primary vectors:
    - **Worker Activity**: active nodes currently online.
    - **Company Load**: Number of active projects.
    - **Financial Velocity**: 24h payout volume.
    - **Quality Delta**: Global accuracy vs. previous period.
- **Network Load Visualizer**: Integrated an Area Chart showing "Protocol Load" (tasks vs. system capacity) to help admins decide when to scale infrastructure.
- **Modular Action Hubs**: Created `ControlModule` cards for the most frequent tasks, like "Review Payouts" or "Emergency System Brake."

## 💻 Implementation Details
- **File**: `admin-panel/src/App.tsx`
- **Component**: `Overview()`.
- **Sub-components**: `StatIndicator`, `ControlModule`.

### Global KPI Tracking
- **Protocol Load**: Percentage of system processing power currently in use.
- **Active Threads**: Simultaneous task sessions across the globe.

## 🧪 Verification
- [x] Stat indicators reflect trend colors (Emerald/Rose/Slate) correctly.
- [x] Main chart scales data points based on time of day.
- [x] Quick-action buttons trigger the correct state transition in the `view` router.
