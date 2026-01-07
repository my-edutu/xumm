# Feature: Advanced Analytics Dashboard

## 📝 The Journey
Data is useless without clarity. I engineered the Analytics Dashboard to be the "Intelligence Hub" for companies, providing recursive insights into their dataset quality and worker efficiency.

### Engineering Decisions
- **Multi-Range Date Filtering**: Built a system that allows switching between "Last 24h", "7 Days", and "Custom Range", with automatic re-fetching of metrics.
- **KPI Card Architecture**: 
    - Implemented `KPICard` with "Inverse Trend" support (e.g., higher latency is bad, so trend "up" is colored red).
    - Visual trend sparks to show historical performance within the card.
- **Top Contributor Analytics**: A specialized section using `WorkerCard` to identify the "Power Nodes" in the network based on volume and precision.
- **Geographic Distribution**: (Mocked) A globe-based view showing where the linguistic data is originating from.

## 💻 Implementation Details
- **File**: `company/src/pages/Analytics.tsx`
- **Component**: `Analytics()`.
- **Sub-components**: `KPICard`, `WorkerCard`, `InsightCard`.

### Core Metrics Tracked
- **Volume**: Total submissions over time.
- **Quality**: Average precision score across all reviewers.
- **Latency**: Mean time from task creation to final verification.
- **Unit Cost**: Efficiency of spend.

## 🧪 Verification
- [x] Trend colors invert correctly for latency metrics.
- [x] Export function generates a CSV/PDF summary (Mocked handshake).
- [x] Tooltips on charts show granular data points.
