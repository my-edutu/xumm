# XUM Marketplace Security Architecture

## Overview

The XUM Marketplace Bridge provides a secure connection between the Admin Panel and Company Portal for managing and selling data assets. This document outlines the security measures implemented.

## Security Principles

### 1. Defense in Depth
Multiple layers of security ensure that even if one layer is compromised, others remain intact:

- **Network Layer**: Apps run on separate ports with no direct communication
- **Application Layer**: Type-safe services with input validation
- **Database Layer**: Row Level Security (RLS) policies enforce access control
- **Function Layer**: SECURITY DEFINER functions with explicit permission checks

### 2. Least Privilege
- Companies can only read published assets they're authorized for
- Admins must explicitly grant purchase authorization per company/asset
- Download tokens are time-limited and count-limited
- All sensitive operations require authentication

### 3. Complete Audit Trail
- All marketplace operations are logged to `marketplace_audit_log`
- Audit log is immutable (UPDATE/DELETE operations are blocked)
- Logs include actor IP, user agent, session ID, and exact changes

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MarketplaceManager Component                                │  │
│  │  - Create/edit data assets                                   │  │
│  │  - Publish/unpublish assets                                  │  │
│  │  - Grant company authorizations                              │  │
│  │  - View purchase history & audit logs                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Admin-Only Functions (SECURITY DEFINER)                     │  │
│  │  - admin_create_data_asset()                                 │  │
│  │  - admin_set_asset_visibility()                              │  │
│  │  - admin_authorize_company()                                 │  │
│  │  - admin_revoke_authorization()                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                       SUPABASE BACKEND                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tables with RLS                                             │  │
│  │  - data_assets (visibility-controlled)                       │  │
│  │  - company_asset_authorizations                              │  │
│  │  - asset_purchases                                           │  │
│  │  - marketplace_audit_log (immutable)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Public Functions (Company-Accessible)                       │  │
│  │  - company_purchase_asset() - validates authorization        │  │
│  │  - validate_download_token() - secure download access        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                       COMPANY PORTAL                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  DataMarketplace Component                                   │  │
│  │  - Browse published assets (RLS filters unauthorized)        │  │
│  │  - View authorization status & pricing                       │  │
│  │  - Purchase authorized assets                                │  │
│  │  - Download purchased datasets                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  marketplaceService.ts                                       │  │
│  │  - Type-safe API calls                                       │  │
│  │  - Error handling with friendly messages                     │  │
│  │  - Input validation                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Database Security

### Row Level Security Policies

| Table | Role | SELECT | INSERT | UPDATE | DELETE |
|-------|------|--------|--------|--------|--------|
| `data_assets` | Admin | ✅ All | ✅ All | ✅ All | ✅ All |
| `data_assets` | Company | ✅ Published + Authorized | ❌ | ❌ | ❌ |
| `company_asset_authorizations` | Admin | ✅ All | ✅ All | ✅ All | ✅ All |
| `company_asset_authorizations` | Company | ✅ Own only | ❌ | ❌ | ❌ |
| `asset_purchases` | Admin | ✅ All | ✅ All | ✅ All | ✅ All |
| `asset_purchases` | Company | ✅ Own only | ✅ Via function | ❌ | ❌ |
| `marketplace_audit_log` | Admin | ✅ All | ✅ Via triggers | ❌ Blocked | ❌ Blocked |

### Function Security

All SECURITY DEFINER functions include:

1. **Role verification**: `verify_admin_caller()` checks `auth.uid()` role
2. **Input validation**: SQL injection prevention via parameterized queries
3. **Audit logging**: All operations are logged before committing

---

## Purchase Flow Security

```
1. Company browses marketplace
   → RLS filters to published + authorized assets only

2. Company clicks "Purchase"
   → company_purchase_asset() validates:
      - Asset exists and is published
      - Company has active authorization
      - Authorization type allows purchase
      - Authorization hasn't expired

3. Purchase record created
   → Secure access_token generated (32 random bytes, hex encoded)
   → Token has 7-day expiration
   → Download count initialized to 0

4. Payment processed (external)
   → payment_status updated to 'paid'
   → delivery_status updated to 'generating'

5. Company downloads dataset
   → validate_download_token() checks:
      - Token exists and hasn't expired
      - Payment is complete
      - Download count < max_downloads
   → Returns presigned S3 URL
   → Increments download count
   → Logs access to audit trail
```

---

## Download Token Security

- **Generation**: `encode(gen_random_bytes(32), 'hex')` - 256 bits of entropy
- **Expiration**: Tokens expire after 7 days by default
- **Rate Limiting**: Max 5 downloads per purchase (configurable)
- **Logging**: Each download is logged with timestamp and IP

---

## Audit Log Schema

```sql
marketplace_audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,          -- e.g., 'purchase_initiated'
  event_severity TEXT,               -- 'info', 'warning', 'critical'
  actor_id UUID,                     -- Who performed the action
  actor_role TEXT,                   -- 'admin' or 'company'
  actor_ip TEXT,                     -- Captured via Edge Function
  target_type TEXT,                  -- 'data_asset', 'authorization', 'purchase'
  target_id UUID,                    -- ID of affected record
  old_values JSONB,                  -- Previous state (for updates)
  new_values JSONB,                  -- New state
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Immutability Enforcement**:
```sql
CREATE RULE prevent_audit_update AS ON UPDATE TO marketplace_audit_log DO INSTEAD NOTHING;
CREATE RULE prevent_audit_delete AS ON DELETE TO marketplace_audit_log DO INSTEAD NOTHING;
```

---

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Unauthorized asset access | RLS policies filter by visibility + authorization |
| Price manipulation | Authorization table stores approved pricing |
| Token replay attacks | One-time tokens with expiration and download limits |
| Admin impersonation | `verify_admin_caller()` checks role in secure function |
| Audit log tampering | UPDATE/DELETE blocked at database level |
| SQL injection | Parameterized queries in all functions |
| Excessive downloads | `max_downloads` limit enforced on each access |

---

## Future Enhancements

1. **IP Geolocation Restrictions**: Limit downloads to company's registered geography
2. **Webhook Notifications**: Alert admins on purchase events
3. **Two-Factor Authorization**: Require 2FA for high-value purchases
4. **Encrypted Assets at Rest**: AES-256 encryption of dataset files
5. **API Rate Limiting**: Prevent abuse of marketplace endpoints

---

## Files Created

| File | Purpose |
|------|---------|
| `supabase/15_secure_marketplace_bridge.sql` | Database schema, RLS policies, and functions |
| `admin-panel/src/components/MarketplaceManager.tsx` | Admin UI for asset management |
| `company/src/pages/DataMarketplace.tsx` | Company UI for browsing/purchasing |
| `company/src/services/marketplaceService.ts` | Secure API service layer |
| `doc/marketplace-security.md` | This documentation |
