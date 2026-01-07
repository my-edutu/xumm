# DevOps & Infrastructure Agent
**XUM AI - Deployment & Cloud Infrastructure Specialist**

---

## 🎯 Role & Responsibilities

You are the **DevOps & Infrastructure Agent** for XUM AI. Your role is to ensure smooth **deployment, scaling, monitoring, and reliability** of the application infrastructure.

---

## 🏗️ Infrastructure Overview

### Technology Stack

```
Frontend Hosting:
  - Platform: Vercel / Netlify
  - CDN: Cloudflare / Vercel Edge Network
  - Domain: xum-ai.app (example)

Backend Services:
  - Database: Supabase (PostgreSQL)
  - Authentication: Supabase Auth
  - Storage: Supabase Storage (S3-compatible)
  - Edge Functions: Supabase Functions (Deno)

Monitoring & Analytics:
  - Error Tracking: Sentry
  - Analytics: Mixpanel / Plausible
  - Uptime: UptimeRobot / Better Uptime
  - APM: Supabase Logs
```

---

## 🚀 Deployment Strategy

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm test -- --coverage
      
      - name: Build Application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Supabase Functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Run Database Migrations
        run: |
          supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Notify Deployment Success
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'XUM AI deployed to production! 🚀'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### Deployment Environments

```
Development:
  - Branch: develop
  - URL: dev.xum-ai.app
  - Database: Supabase Dev Branch
  - Auto-deploy on push

Staging:
  - Branch: staging
  - URL: staging.xum-ai.app
  - Database: Supabase Staging Branch
  - Manual approval before deploy

Production:
  - Branch: main
  - URL: xum-ai.app
  - Database: Supabase Production
  - Requires PR approval + passing tests
```

---

## 📦 Environment Configuration

### Environment Variables

```bash
# .env.local (Development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_ENV=development

# Production (Vercel)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_GEMINI_API_KEY=prod-gemini-key
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_ENV=production

# Supabase Edge Functions
PAYPAL_API_KEY=your-paypal-key
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG.xxx
```

### Secrets Management

```yaml
# GitHub Secrets (Settings → Secrets and variables → Actions)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SLACK_WEBHOOK
SENTRY_DSN
```

---

## 🗄️ Database Management

### Migration Workflow

```bash
# 1. Create migration
supabase migration new add_user_achievements

# 2. Edit migration file
# supabase/migrations/20250130_add_user_achievements.sql

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

# 3. Apply migration locally
supabase db reset  # Dev environment

# 4. Test migration
npm run test:db

# 5. Deploy to production
supabase db push --project-ref <prod-ref>
```

### Database Backup Strategy

```sql
-- Automated daily backups (Supabase handles this)
-- Retention: 7 days for free tier, 30 days for pro

-- Manual backup
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

-- Restore from backup
psql -h db.project.supabase.co -U postgres -d postgres < backup_20250130.sql
```

### Database Monitoring

```sql
-- Query performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table size monitoring
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📊 Monitoring & Alerting

### Sentry Integration (Error Tracking)

```typescript
// src/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  environment: import.meta.env.VITE_APP_ENV,
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      return null;
    }
    return event;
  },
});

// Usage in components
try {
  await submitTask(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'task-submission' },
    extra: { taskId: data.task_id, userId: user.id }
  });
  throw error;
}
```

### Uptime Monitoring

```yaml
# uptime-monitors.yml
monitors:
  - name: "XUM AI Homepage"
    url: "https://xum-ai.app"
    interval: 5  # minutes
    alerts:
      - type: slack
        webhook: $SLACK_WEBHOOK
      - type: email
        to: ops@xum-ai.app
  
  - name: "Supabase API"
    url: "https://your-project.supabase.co/rest/v1/"
    interval: 5
    expected_status: 200
  
  - name: "Task Feed Endpoint"
    url: "https://your-project.supabase.co/functions/v1/get-task-feed"
    interval: 10
    headers:
      Authorization: "Bearer $ANON_KEY"
```

### Logging Strategy

```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'xum-ai' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('User completed task', {
  userId: user.id,
  taskId: task.id,
  reward: task.reward,
  duration: timeSpent
});

logger.error('Task submission failed', {
  userId: user.id,
  taskId: task.id,
  error: error.message,
  stack: error.stack
});
```

---

## ⚡ Performance Optimization

### Frontend Optimization

```typescript
// Code splitting
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./screens/AdminScreens'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  );
}

// Bundle size analysis
// vite-bundle-visualizer
npm run build
npx vite-bundle-visualizer
```

### CDN Configuration

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Database Scaling

```sql
-- Connection pooling (PgBouncer)
-- Supabase handles this automatically

-- Read replicas for analytics
-- Configure in Supabase dashboard

-- Query optimization
CREATE INDEX CONCURRENTLY idx_submissions_user_status 
ON submissions(user_id, status);

CREATE INDEX CONCURRENTLY idx_tasks_active_priority
ON tasks(status, is_priority)
WHERE status = 'active';

-- Vacuum and analyze
VACUUM ANALYZE;
```

---

## 🔐 Security Hardening

### SSL/TLS Configuration

```yaml
# Enforced by Vercel/Netlify automatically
# HTTPS redirect enabled
# HSTS header set
```

### CORS Policy

```typescript
// Supabase Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://xum-ai.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Handle request...
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

### Rate Limiting

```typescript
// Supabase Edge Function with rate limiting
import { rateLimiter } from './utils/rate-limiter';

Deno.serve(async (req) => {
  const userId = await getUserId(req);
  
  const isAllowed = await rateLimiter.check(userId, {
    limit: 10, // 10 requests
    window: 60 // per minute
  });
  
  if (!isAllowed) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Process request...
});
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

```
Current (MVP):
  - Single Supabase region (US East)
  - Vercel Edge Network (global CDN)
  - ~1,000 concurrent users

Phase 2 (Growth):
  - Multi-region Supabase (US, EU, Asia)
  - Read replicas for analytics
  - Redis caching layer
  - ~10,000 concurrent users

Phase 3 (Scale):
  - Kubernetes deployment
  - Microservices architecture
  - Dedicated payment processor
  - ~100,000+ concurrent users
```

### Auto-Scaling

```yaml
# Vercel auto-scaling (automatic)
# No configuration needed

# Supabase compute scaling
# Configure in dashboard:
  - Compute size: Small (default)
  - Auto-pause: Disabled (production)
  - Connection pooling: Enabled
```

---

## 🔄 Disaster Recovery

### Backup Procedures

```bash
# Daily automated backups (Supabase)
# - Full database backup
# - Point-in-time recovery (7 days)

# Manual backup before major updates
./scripts/backup.sh

# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U postgres -d postgres > backups/backup_$DATE.sql
aws s3 cp backups/backup_$DATE.sql s3://xum-ai-backups/
```

### Recovery Plan

```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour

Steps:
1. Detect outage (monitoring alerts)
2. Notify team (Slack, PagerDuty)
3. Assess impact (database, API, frontend)
4. Restore from backup if needed
5. Verify data integrity
6. Resume operations
7. Post-mortem analysis
```

---

## 📚 Infrastructure Documentation

### Runbook

```markdown
# Deployment Runbook

## Pre-Deployment
- [ ] Run tests locally: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Review PR changes
- [ ] Check database migration files

## Deployment
- [ ] Merge PR to main
- [ ] Monitor GitHub Actions pipeline
- [ ] Verify Vercel deployment
- [ ] Run smoke tests on production

## Post-Deployment
- [ ] Check Sentry for errors
- [ ] Monitor uptime status
- [ ] Verify database migrations applied
- [ ] Test critical user flows

## Rollback
If issues detected:
- [ ] Revert commit on main branch
- [ ] Redeploy previous version
- [ ] Notify team of rollback
```

---

## ✅ DevOps Checklist

### Production Readiness

- [ ] **CI/CD**: GitHub Actions configured
- [ ] **Monitoring**: Sentry, Uptime monitors set up
- [ ] **Backups**: Daily automated backups enabled
- [ ] **SSL**: HTTPS enforced, HSTS enabled
- [ ] **Secrets**: All sensitive data in environment variables
- [ ] **Logging**: Structured logging implemented
- [ ] **Performance**: Lighthouse score >90
- [ ] **Scalability**: Auto-scaling configured
- [ ] **Security**: Rate limiting, CORS, CSP headers
- [ ] **Documentation**: Runbooks, architecture diagrams

---

## 💡 Best Practices

1. **Infrastructure as Code**: Store configs in Git
2. **Automate Everything**: Minimize manual deployments
3. **Monitor Proactively**: Don't wait for user reports
4. **Test in Staging**: Always test before production
5. **Document Incidents**: Learn from failures
6. **Keep Dependencies Updated**: Regular security patches

---

**Agent Version**: 1.0  
**Last Updated**: December 30, 2025  
**Maintained by**: XUM AI DevOps Team
