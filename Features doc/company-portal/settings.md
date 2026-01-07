# System Settings Module

The **System Settings** module provides company administrators with the tools to configure their organizational profile, security parameters, and API integration keys.

## Features

### 🏢 Company Profile
- **Identity Management:** Update company name, contact email, and industry.
- **Regional Settings:** Configure timezones for accurate analytics reporting.
- **Branding:** Visual representation of company identity within the platform.

### 🛡️ Security & Privacy
- **Multi-Factor Authentication (MFA):** Extra protection layer for company accounts.
- **Password Management:** Secure password rotation workflows.
- **Session Control:** Monitor and manage active login sessions across devices and geolocations.

### 🔑 API & Integrations
- **Key Management:** Create and revoke API keys for external integration.
- **Environment Separation:** Support for both Production and Sandbox keys.
- **Security Headers:** Automatic security practice reminders for developers.

### 🔔 Notifications
- **Granular Controls:** Toggle alerts for project milestones, quality dips, and financial summaries.
- **Channel Routing:** Configure preferences for in-app and email notifications.

## Technical Architecture
- **State Management:** Uses React `useState` for internal navigation and local feedback.
- **Visual System:** Utilizes the XUM Cinematic Design System with `glass-card` effects and `animate-in` transitions.
- **Componentized Design:** Separated render functions for Profile, Security, API, and Notifications ensure maintainability.

## Security Considerations
- API keys are masked by default.
- One-click revocation for compromised keys.
- Real-time IP and browser detection for active sessions.
