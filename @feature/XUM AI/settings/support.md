# Feature: Comms Hub & Support Labs

## 📝 The Journey
When things go wrong or new tasks arise, the user needs a central "Comms Hub." I designed the Notifications and Support screens to feel like direct channels to the XUM AI HQ.

### Engineering Decisions
- **Notification Urgency**: Used color-coded icons (Emerald for Success, Blue for Info, Orange for Finance) to allow users to scan their activity log instantly.
- **Support Ticket CTA**: A high-impact, full-width card for "Request Assistance" with a background `support_agent` icon at high scale.
- **Operational FAQ**: Used an accordion system (`details`/`summary`) for FAQs to keep the UI clean while providing deep textual answers.
- **Protocol Versioning**: Added a "Protocol v4.0.2 Stable" footer to the support screen to reinforce the "System OS" feel of the app.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Components**: `NotificationsScreen`, `SupportScreen`.

### Comms Hierarchy
- **Real-time Stats**: "Handshake Verified", "Payout Processed".
- **Network Alerts**: "New High-Reward RLHF mission".

## 🧪 Verification
- [x] Accordion opens/closes smoothly.
- [x] "Open Support Ticket" button triggers visual feedback.
- [x] Mark all read button (UI placeholder).
