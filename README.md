# XUM AI Monorepo

This repository contains the XUM AI ecosystem with three independent applications sharing common backend resources.

## Project Structure

```
xum-ai/
├── XUM AI/         # Main user-facing mobile app
├── company/        # Company Portal for businesses
├── Admin Panel/    # Internal admin dashboard
├── supabase/       # Shared backend schema and functions
├── doc/            # Shared documentation
├── agents/         # AI agent definitions
├── linguasence/    # Linguasense engine utilities
├── api/            # API architecture documentation
```

## Running the Applications

Each application runs independently on its own port:

### XUM AI (Port 3000)
```bash
cd "XUM AI"
npm install
npm run dev
```
Access at: `http://localhost:3000`

### Company Portal (Port 3001)
```bash
cd company
npm install
npm run dev
```
Access at: `http://localhost:3001`

### Admin Panel (Port 3002)
```bash
cd "Admin Panel"
npm install
npm run dev
```
Access at: `http://localhost:3002`

## Shared Resources

The following directories are shared across all applications:
- `supabase/` - Database schema, migrations, and edge functions
- `doc/` - Project documentation and specifications
- `agents/` - AI agent configurations
- `linguasence/` - Linguasense engine utilities
- `api/` - API endpoint definitions

## Environment Variables

Each app requires its own `.env.local` file with Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Documentation

### Company Portal
- [Analytics System Documentation](company/docs/ANALYTICS_SYSTEM.md) - Comprehensive guide to the analytics features
- [Analytics Cheatsheet](company/docs/ANALYTICS_CHEATSHEET.md) - Quick reference for developers

### API & Architecture
- [API Architecture](api/API_ARCHITECTURE.md) - Backend API design and endpoints
- [Security Audit](SECURITY_AUDIT.md) - Security review and recommendations

### Database
- [Core Schema](supabase/00_schema.sql) - Base tables (users, tasks, submissions)
- [Analytics Schema](supabase/14_analytics_schema.sql) - Analytics tables and functions
- [Realtime Schema](supabase/15_realtime_analytics.sql) - Real-time alerts and email reports

## Features

### XUM AI
- Task marketplace
- Earnings and withdrawals
- Gamification (XP, levels, achievements)
- Social features

### Company Portal
- Project/campaign management
- **Analytics Dashboard** - KPIs, charts, trends
- **Workforce Analytics** - Worker performance and rankings
- **Alerts & Reports** - Anomaly detection and scheduled emails
- Budget and billing management

### Admin Panel
- User management
- Task moderation
- Financial oversight
- System configuration
