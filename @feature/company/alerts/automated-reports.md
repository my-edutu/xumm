# Feature: Real-time Alerts & Automated Reports

## 📝 The Journey
Large-scale AI training never sleeps. I built an "Alerts & Reports" module that monitors the network 24/7 and keeps managers informed via both the UI and automated emails.

### Engineering Decisions
- **Threshold Monitoring**: Managers can set "Watchdogs" on specific KPIs (e.g., "Alert me if accuracy drops below 85%").
- **Scheduled Email Synopses**: Instead of manual checks, I built a service that aggregates the last 24h of data into a "Clean Slate" email report.
- **Real-time Stat Bar**: A high-velocity data strip at the top of the alerts page showing "Total Alerts", "Anomaly Score", and "Active Watchdogs."
- **Recursive Alert Cards**: Each alert is a "Node" with a severity level (Critical, Warning, Info) and a direct link to the offending task or project.

## 💻 Implementation Details
- **File**: `company/src/pages/AlertsAndReports.tsx`
- **Services**: 
    - `realtimeAnalyticsService.ts` (The Watchdog engine)
    - `emailReportsService.ts` (The Delivery engine)
- **State**: `Alert`, `EmailReport`, `Threshold`.

### Alert Severity Logic
- **Critical (Red)**: Potential fraud or catastrophic accuracy failure.
- **Warning (Orange)**: Trend shifting negatively or budget running low.
- **Info (Blue)**: Project completed or milestone reached.

## 🧪 Verification
- [x] Tab navigation switches between Alerts, Reports, and Threshold Settings.
- [x] The Anomaly Score pulses Red when a critical alert is present.
- [x] Threshold form saves correctly to the `watchdog_configs` table.
