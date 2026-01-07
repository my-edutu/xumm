# Feature: Company Dashboard (Strategic Overview)

## 📝 The Journey
The Company Dashboard was built to provide project managers with an "at-a-glance" status of their AI training operations. It combines high-level financial health with granular project tracking.

### Engineering Decisions
- **Side-Docked Navigation**: Used a persistent sidebar with `SidebarItem` components for quick context switching between Analytics, Billing, and Tasks.
- **Metric Micro-Cards**: Created `StatCard` components that display value, label, and trend indicators (up/down) with color-coded Lucide icons.
- **Project Lifecycle Tracking**: 
    - Implemented a "Current Projects" table that tracks status (In Progress, Review, Completed), progress percentage, and real-time cost accumulation.
    - Used a `ProjectRow` sub-component to keep the main view decluttered.
- **Visual Analytics Feed**: Integrated a Bar Chart (mocked via `ChartData`) to show daily submission distributions, allowing managers to spot workflow bottlenecks immediately.

## 💻 Implementation Details
- **File**: `company/src/App.tsx`
- **Main View**: `App()`
- **Components**: `StatCard`, `ProjectRow`, `ProjectTypeItem`.

### Key Metrics
- **Active Workers**: Number of nodes currently processing tasks.
- **Total Submissions**: Lifetime throughput.
- **Accuracy Rate**: Global quality score.
- **Available Credits**: Remaining budget in the company escrow.

## 🧪 Verification
- [x] Trend indicators show correct colors (Emerald for up, Rose for down).
- [x] Project progress bars reflect the `progress` prop accurately.
- [x] Sidebar navigation updates the `activeTab` state without full page reloads.
