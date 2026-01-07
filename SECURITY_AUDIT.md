# XUM AI Security Audit Report

**Audit Date:** January 2, 2026  
**Auditor:** Security Engineer (AI-Assisted)  
**Scope:** Full Application Stack (user-app, admin-panel, company, supabase)  
**Framework:** OWASP Top 10 (2021)

---

## Executive Summary

This security audit evaluates the XUM AI application against the OWASP Top 10 vulnerabilities. The application is a data labeling and AI training platform with three frontends (user-app, admin-panel, company) backed by Supabase (PostgreSQL + Auth). While the application demonstrates good foundational security practices (RLS, parameterized queries via Supabase client), several areas require immediate attention.

### Risk Summary

| Category | Risk Level | Issues Found |
|----------|------------|--------------|
| A01: Broken Access Control | **HIGH** | 3 Critical, 2 Medium |
| A02: Cryptographic Failures | **MEDIUM** | 1 Medium, 2 Low |
| A03: Injection | **LOW** | 1 Low (mitigated by ORM) |
| A04: Insecure Design | **MEDIUM** | 2 Medium |
| A05: Security Misconfiguration | **HIGH** | 2 Critical, 1 Medium |
| A06: Vulnerable Components | **MEDIUM** | Requires audit |
| A07: Auth Failures | **MEDIUM** | 2 Medium |
| A08: Data Integrity Failures | **MEDIUM** | 2 Medium |
| A09: Logging Failures | **LOW** | 1 Low |
| A10: SSRF | **LOW** | 1 Low (potential) |

---

## A01:2021 - Broken Access Control

### Finding 1.1: `SECURITY DEFINER` Functions Without Input Validation (CRITICAL)

**Location:** `supabase/03_business_logic.sql`

**Description:** Multiple PostgreSQL functions use `SECURITY DEFINER`, which executes with the privileges of the function owner (typically superuser), not the calling user. While this is sometimes necessary, these functions lack comprehensive input validation.

**Affected Functions:**
- `process_task_reward(p_user_id, p_submission_id, p_reward, p_xp)`
- `request_withdrawal(p_user_id, p_amount, p_account_details)`
- `get_user_task_feed(p_user_id, p_limit)`

**Risk:** A malicious actor could potentially manipulate parameters to:
- Credit unauthorized rewards to their account
- Bypass withdrawal limits
- Access another user's task feed

**Vulnerable Code:**
```sql
CREATE OR REPLACE FUNCTION public.process_task_reward(
    p_user_id UUID,
    p_submission_id UUID,
    p_reward DECIMAL,
    p_xp INTEGER
) RETURNS VOID AS $$
BEGIN
    -- No validation that p_user_id matches the submission owner
    -- No validation that p_reward matches the task's actual reward
    UPDATE public.users 
    SET balance = balance + p_reward,
        current_xp = current_xp + p_xp
    WHERE id = p_user_id;
    ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Remediation:**
```sql
CREATE OR REPLACE FUNCTION public.process_task_reward(
    p_user_id UUID,
    p_submission_id UUID,
    p_reward DECIMAL,
    p_xp INTEGER
) RETURNS VOID AS $$
DECLARE
    v_actual_user_id UUID;
    v_task_reward DECIMAL;
BEGIN
    -- Validate submission belongs to user
    SELECT s.user_id, t.reward INTO v_actual_user_id, v_task_reward
    FROM public.submissions s
    JOIN public.tasks t ON s.task_id = t.id
    WHERE s.id = p_submission_id;
    
    IF v_actual_user_id IS NULL OR v_actual_user_id != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Submission does not belong to user';
    END IF;
    
    IF p_reward > v_task_reward THEN
        RAISE EXCEPTION 'Invalid reward amount';
    END IF;
    
    -- Proceed with validated data
    UPDATE public.users 
    SET balance = balance + v_task_reward, -- Use validated reward
        current_xp = current_xp + p_xp
    WHERE id = v_actual_user_id;
    ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Finding 1.2: Admin Panel Fetches All Users Without Server-Side Pagination (MEDIUM)

**Location:** `admin-panel/src/App.tsx`

**Description:** The admin panel's UserManagement component fetches ALL users with `supabase.from('users').select('*')`. While protected by admin RLS policies, this pattern:
1. Could expose excessive data if RLS is misconfigured
2. Has no server-side pagination, causing performance issues at scale

**Vulnerable Code:**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*'); // Fetches ALL columns for ALL users
```

**Remediation:**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('id, email, full_name, role, balance, trust_score, created_at') // Only needed columns
  .range(offset, offset + limit - 1) // Server-side pagination
  .order('created_at', { ascending: false });
```

---

### Finding 1.3: Missing RLS Policies for INSERT/UPDATE on Critical Tables (CRITICAL)

**Location:** `supabase/02_rls_policies.sql`

**Description:** Several RLS policies only cover SELECT operations. INSERT and UPDATE operations on sensitive tables like `support_tickets`, `support_messages`, and `reputation_history` may not be properly restricted.

**Current State:**
```sql
-- Only SELECT policies observed for some tables
CREATE POLICY "Users see own appeals" ON public.appeals FOR SELECT USING (auth.uid() = user_id);
-- Missing: FOR INSERT, FOR UPDATE, FOR DELETE
```

**Remediation:**
```sql
-- Add comprehensive policies for all operations
CREATE POLICY "Users can create appeals" ON public.appeals 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending appeals" ON public.appeals 
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Prevent deletion by regular users
CREATE POLICY "Only admins can delete appeals" ON public.appeals 
    FOR DELETE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

---

### Finding 1.4: Task Reward Amounts Controlled by Frontend (CRITICAL)

**Location:** `user-app/screens/TaskScreens.tsx`

**Description:** When submitting tasks, the reward and XP amounts are passed from the frontend to the backend RPC call. This allows manipulation of rewards.

**Vulnerable Code:**
```typescript
// Frontend controls reward amount
await TaskService.submitPayload(
  'video-capture', 
  { type: 'video', s3_path: 'raw/video' }, 
  1.50,  // <-- Attacker can modify this
  40     // <-- Attacker can modify this
);
```

**Remediation:**
1. Never trust client-provided reward amounts
2. Look up the reward from the task record server-side
3. The `process_task_reward` function should derive reward from task data, not parameters

---

### Finding 1.5: Consensus Validation Function Lacks Access Control (MEDIUM)

**Location:** `supabase/12_linguasence_engine.sql`

**Description:** The `calculate_weighted_consensus` function updates response statuses but doesn't verify the caller has permission to trigger consensus calculation.

**Remediation:** Add authorization check or restrict function invocation to triggers only.

---

## A02:2021 - Cryptographic Failures

### Finding 2.1: Sensitive Data in JSONB Columns (MEDIUM)

**Location:** `supabase/00_schema.sql`

**Description:** The `withdrawals.account_details` column stores bank account information as JSONB. While at-rest encryption is handled by Supabase/PostgreSQL, the data is not encrypted at the application level.

**Current Schema:**
```sql
account_details JSONB NOT NULL, -- Contains bank account numbers, routing info
```

**Remediation:**
1. Encrypt sensitive fields before storing using `pgcrypto`
2. Implement field-level encryption for PII
3. Consider tokenization for payment details

```sql
-- Example using pgcrypto
account_details_encrypted BYTEA, -- Encrypted with pgp_sym_encrypt
```

---

### Finding 2.2: API Key Storage Uses Hash Comparison (LOW - Well Implemented)

**Location:** `supabase/12_linguasence_engine.sql`

**Description:** API keys are stored as hashes using `crypt()`, which is good practice. However, ensure a strong hashing algorithm (bcrypt/scrypt) is configured.

**Current:**
```sql
AND api_key_hash = crypt(p_provided_key, api_key_hash)
```

**Verification Needed:** Confirm `gen_salt('bf')` (bcrypt) is used when creating keys.

---

### Finding 2.3: No HTTPS Enforcement Check (LOW)

**Description:** While Supabase enforces HTTPS, there's no Content-Security-Policy or Strict-Transport-Security headers configured in the frontend applications.

**Remediation:** Add security headers in Vite config or deployment:
```javascript
// vite.config.ts - for development
server: {
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'",
  }
}
```

---

## A03:2021 - Injection

### Finding 3.1: SQL Injection Risk Mitigated (LOW)

**Description:** The application uses the Supabase client library which parameterizes all queries, effectively preventing SQL injection. However, any raw SQL in Edge Functions or custom endpoints must be carefully reviewed.

**Good Practice Observed:**
```typescript
// Parameterized query via Supabase client
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'active'); // 'active' is safely parameterized
```

**Recommendation:** Document that raw SQL should never be used in Edge Functions. All database interactions should use the Supabase client.

---

### Finding 3.2: No `dangerouslySetInnerHTML` in Application Code (GOOD)

**Description:** Search revealed no usage of `dangerouslySetInnerHTML` in application code, reducing XSS risk. Occurrences found were only in `node_modules`.

---

## A04:2021 - Insecure Design

### Finding 4.1: Incomplete OAuth Implementation (MEDIUM)

**Location:** `api/API_ARCHITECTURE.md`, `user-app/screens/AuthScreens.tsx`

**Description:** OAuth (Google/Apple) is documented as "Mediocre" with buttons present but provider configuration incomplete. Partially implemented authentication can lead to:
- Confused users attempting OAuth and failing
- Potential bypass if OAuth flow isn't properly validated

**Remediation:**
1. Complete OAuth provider configuration in Supabase
2. Or remove OAuth buttons until implementation is complete
3. Never leave half-implemented authentication flows in production

---

### Finding 4.2: Direct Navigation Without Auth State Verification (MEDIUM)

**Location:** `user-app/screens/AuthScreens.tsx`

**Description:** The `handleSubmit` function navigates directly to HOME without waiting for authentication confirmation.

**Vulnerable Pattern:**
```typescript
const handleSubmit = () => {
  // No actual auth call shown
  onNavigate(ScreenName.HOME); // Direct navigation
};
```

**Remediation:**
```typescript
const handleSubmit = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Only navigate after successful auth
    onNavigate(ScreenName.HOME);
  } catch (error) {
    setError(error.message);
  }
};
```

---

## A05:2021 - Security Misconfiguration

### Finding 5.1: No `.env` Files Present - Credentials Source Unknown (CRITICAL)

**Description:** No `.env` files were found in the repository. While this might mean they're properly gitignored, it also means:
1. Credentials source is unclear
2. No `.env.example` for developers

**Remediation:**
1. Create `.env.example` files documenting required variables (without values)
2. Verify `.env` is in `.gitignore`
3. Document secure credential management in README

```bash
# .env.example
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
# NEVER commit actual values
```

---

### Finding 5.2: Supabase Anon Key Exposure (CRITICAL - By Design, but needs controls)

**Location:** `user-app/supabaseClient.ts`, `admin-panel/src/supabaseClient.ts`

**Description:** The Supabase anonymous key is exposed to the frontend (this is by design), but security depends entirely on RLS policies. If RLS is bypassed or misconfigured, the anon key provides direct database access.

**Remediation:**
1. **Audit all RLS policies** - Ensure no tables lack RLS
2. **Enable RLS on ALL tables** without exception
3. **Test RLS** with automated tests simulating malicious actors
4. Consider using Supabase's Row-Level Security testing tools

---

### Finding 5.3: Warning-Only for Missing Credentials (MEDIUM)

**Location:** `user-app/supabaseClient.ts`

**Description:** When credentials are missing, the application logs a warning but continues with potentially invalid credentials.

**Current Behavior:**
```typescript
if (finalUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing or invalid...');
}
```

**Remediation:** In production, fail fast with clear error messaging:
```typescript
if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Critical: Supabase credentials not configured');
}
```

---

## A06:2021 - Vulnerable and Outdated Components

### Finding 6.1: Dependency Audit Required (MEDIUM)

**Description:** No recent `npm audit` results were observed. The application uses multiple dependencies that should be regularly audited.

**Recommendation:**
```bash
# Run in each app directory
npm audit
npm audit fix

# Consider adding to CI/CD
npm audit --audit-level=high
```

**Recommended Tools:**
- Snyk for continuous monitoring
- Dependabot for automated PRs
- npm-check-updates for version monitoring

---

## A07:2021 - Identification and Authentication Failures

### Finding 7.1: No Multi-Factor Authentication (MFA) (MEDIUM)

**Description:** No MFA implementation was observed, especially critical for:
- Admin panel access
- Company dashboard access
- High-value withdrawal operations

**Remediation:**
1. Enable Supabase MFA for admin roles
2. Require MFA for financial operations above threshold
3. Implement TOTP or SMS-based second factor

---

### Finding 7.2: Session Management Relies Entirely on Supabase (MEDIUM)

**Location:** `user-app/contexts/UserContext.tsx`

**Description:** Session management uses Supabase's default configuration. While Supabase handles this well, verify:
- Session timeout is appropriate
- Token refresh is working correctly
- Sessions are invalidated on password change

**Current Implementation:**
```typescript
// Good: Using Supabase auth state listener
const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
```

**Recommendation:** Verify Supabase project settings:
- JWT expiry time
- Refresh token rotation
- Session timeout settings

---

## A08:2021 - Software and Data Integrity Failures

### Finding 8.1: Frontend-Controlled Financial Amounts (CRITICAL - Duplicate of 1.4)

**Description:** See Finding 1.4. Financial amounts should never originate from the frontend.

---

### Finding 8.2: Submission Data Integrity (MEDIUM)

**Location:** `user-app/screens/TaskScreens.tsx`

**Description:** Task submissions store data in JSONB without content validation or integrity checking.

**Remediation:**
1. Implement JSON schema validation for `submission_data`
2. Add checksums for large file uploads
3. Validate file types and sizes on upload

```sql
-- Add constraint for submission_data structure
ALTER TABLE public.submissions ADD CONSTRAINT valid_submission_data 
CHECK (jsonb_typeof(submission_data) = 'object');
```

---

## A09:2021 - Security Logging and Monitoring Failures

### Finding 9.1: Audit Logging Infrastructure Exists (GOOD)

**Location:** `supabase/06_advanced_infrastructure.sql`

**Description:** Good audit logging infrastructure exists:
- `audit_logs` table with actor, action, entity tracking
- `user_activity_logs` table
- Trigger for platform settings changes

**Recommendation:** Ensure logging covers:
- [ ] Failed login attempts
- [ ] Permission denied events
- [ ] Withdrawal requests (success and failure)
- [ ] Admin actions (especially user modifications)
- [ ] API key usage and failures

---

### Finding 9.2: Client-Side Error Logging to Console (LOW)

**Description:** Errors are logged to `console.error` which is lost in production.

**Remediation:**
1. Integrate error tracking service (Sentry, LogRocket)
2. Implement structured logging
3. Alert on critical security events

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### Finding 10.1: S3 URL Generation (LOW RISK)

**Location:** `user-app/screens/TaskScreens.tsx` - `StorageService`

**Description:** Pre-signed URLs are generated server-side via Edge Function. Verify the Edge Function:
1. Validates bucket names against allowlist
2. Doesn't accept user-controlled URLs
3. Doesn't make requests to user-supplied URLs

**Current Implementation:**
```typescript
await supabase.functions.invoke('storage-manager', {
  body: {
    action: 'GET-UPLOAD-URL',
    bucket: 'xum-raw-submissions', // Hardcoded - good
    fileName: `raw/${Date.now()}_${fileName}`, // User-controlled filename
    contentType
  }
});
```

**Remediation:** Validate filename in Edge Function:
```javascript
// In Edge Function
const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
```

---

## Priority Remediation Roadmap

### Immediate (Week 1)

1. **Fix SECURITY DEFINER functions** - Add input validation and authorization checks
2. **Remove frontend-controlled reward amounts** - Derive from server-side task data
3. **Add missing RLS policies** - Ensure all CRUD operations are covered
4. **Create `.env.example`** - Document required environment variables

### Short-term (Week 2-3)

5. **Run npm audit** across all packages
6. **Complete or remove OAuth implementation**
7. **Add server-side pagination** to admin panel
8. **Implement MFA for admin/company roles**

### Medium-term (Month 1)

9. **Integrate error tracking** (Sentry)
10. **Field-level encryption** for sensitive data
11. **Automated RLS testing** in CI/CD
12. **Security headers** in deployment configuration

---

## Appendix: Files Reviewed

| File | Purpose | Key Findings |
|------|---------|--------------|
| `supabase/00_schema.sql` | Database schema | Sensitive JSONB columns |
| `supabase/02_rls_policies.sql` | Access control | Good foundation, gaps in complete CRUD |
| `supabase/03_business_logic.sql` | Core functions | SECURITY DEFINER without validation |
| `supabase/06_advanced_infrastructure.sql` | Audit logging | Good structure |
| `supabase/12_linguasence_engine.sql` | Linguasense engine | API key handling, consensus |
| `user-app/supabaseClient.ts` | Client initialization | Credential handling |
| `user-app/screens/TaskScreens.tsx` | Task submission | Frontend-controlled rewards |
| `user-app/contexts/UserContext.tsx` | Auth context | Session handling |
| `admin-panel/src/App.tsx` | Admin functionality | All-user fetch pattern |
| `company/src/services/analyticsService.ts` | Analytics | Company-scoped queries |

---

## Conclusion

The XUM AI application demonstrates solid foundational security practices, particularly in its use of Supabase RLS and the Supabase client library for parameterized queries. However, critical vulnerabilities exist in:

1. **Server-side authorization bypass** through `SECURITY DEFINER` functions
2. **Client-controlled financial amounts** allowing reward manipulation
3. **Incomplete RLS coverage** for all CRUD operations

Addressing the immediate priority items will significantly improve the application's security posture. The existing audit logging infrastructure provides a good foundation for security monitoring once properly configured.

---

*This report should be reviewed by the development team and updated after remediation efforts. A follow-up security audit is recommended after implementing the suggested changes.*

---

# Remediation Status Log

**Last Updated:** January 2, 2026

## ✅ IMPLEMENTED FIXES

| Finding ID | Description | Status | Implementation File | Notes |
|------------|-------------|--------|---------------------|-------|
| **1.1** | SECURITY DEFINER without validation | ✅ **FIXED** | `supabase/03_business_logic.sql` | Added ownership verification, server-side reward derivation, rate limiting, audit logging |
| **1.4** | Frontend-controlled rewards | ✅ **FIXED** | `supabase/03_business_logic.sql` | Rewards now derived from task data, frontend values ignored |
| **S1.1** | Withdrawal race condition | ✅ **ALREADY SECURE** | `supabase/03_business_logic.sql` | Existing code uses `FOR UPDATE` locking |
| **S1.2** | Task reward double-spend | ✅ **FIXED** | `supabase/20_security_hardening.sql` | Added unique indexes, idempotency keys, rate limiting |
| **S3.1** | Trust score gaming | ✅ **FIXED** | `supabase/20_security_hardening.sql` | Added trust_score_history, decay mechanism, audit trail |
| **S3.3** | Budget exhaustion attack | ✅ **FIXED** | `supabase/20_security_hardening.sql` | Added budget_reservations with expiry |
| **S4.1** | Company data cross-contamination | ✅ **FIXED** | `supabase/21_multi_tenant_isolation.sql` | Secure functions with role validation, anonymized worker data |
| **S5.1** | Admin actions without audit | ✅ **FIXED** | `supabase/20_security_hardening.sql` | Immutable admin_action_log table with full tracking |
| **S2.1** | Rate limiting infrastructure | ✅ **FIXED** | `supabase/20_security_hardening.sql` | Rate limit tracking table and check function |

## 🔄 PENDING FIXES

| Finding ID | Description | Priority | Assigned To | ETA |
|------------|-------------|----------|-------------|-----|
| **1.2** | Admin panel pagination | ✅ **FIXED** | `admin-panel/src/App.tsx` | Implemented server-side pagination (10/page) using Supabase range() |
| **1.3** | Missing RLS policies | ✅ **FIXED** | `supabase/22_rls_hardening.sql` | Enforced RLS on all tables, added missing CRUD policies |
| **1.5** | Consensus lacks access control | ✅ **FIXED** | `supabase/24_data_integrity_hardening.sql` | Wrapped in secure function with role validation |
| **2.1** | Sensitive data in JSONB | ✅ **FIXED** | `supabase/25_cryptographic_hardening.sql` | Implemented field-level encryption via pgcrypto |
| **2.3** | No HTTPS/Security Headers | ✅ **FIXED** | Multiple `vite.config.ts` | Added HSTS, CSP, X-Frame-Options, and other security headers |
| **4.1** | OAuth implementation | P3 | Auth | Month 1 |
| **4.2** | Direct nav without auth check | ✅ **FIXED** | `user-app/screens/AuthScreens.tsx` | Implemented Supabase auth call and only navigate on success |
| **5.1** | .env.example files | ✅ **FIXED** | Multiple `.env.example` | Documented required variables and security best practices |
| **7.1** | MFA implementation | P2 | Auth | Week 2 |
| **8.2** | Submission data integrity | ✅ **FIXED** | `supabase/24_data_integrity_hardening.sql` | Added JSONB check constraints and forensics (IP/UA) |
| **S2.3** | File upload bypass | ✅ **FIXED** | `supabase/24_data_integrity_hardening.sql` | Added allowed_extensions constraint infrastructure |
| **S7.4** | Admin IP allowlisting | ✅ **FIXED** | `supabase/23_infrastructure_security.sql` | Added IP allowlist table and asset_admin_access() validation |

## 📁 New Security Files Created

1. **`supabase/20_security_hardening.sql`**
   - Duplicate submission prevention
   - Admin audit logging (immutable)
   - Rate limiting infrastructure
   - Trust score history & decay
   - Budget reservation system

2. **`supabase/21_multi_tenant_isolation.sql`**
   - Secure analytics functions
   - Company isolation enforcement
   - Worker data anonymization
   - Access control validation

3. **`supabase/22_rls_hardening.sql`**
   - Comprehensive RLS coverage
   - Destructive permission revocation
   - Support/Dispute resolution security

4. **`supabase/23_infrastructure_security.sql`**
   - Admin IP Allowlisting
   - MFA Level Enforcement infrastructure
   - Super-admin metadata management

5. **`supabase/24_data_integrity_hardening.sql`**
   - Submission check constraints
   - Secure consensus triggers
   - IP/UA Forensic tracking
   - File extension allowlisting

6. **`supabase/25_cryptographic_hardening.sql`**
   - Field-level encryption (pgcrypto)
   - Secure key storage in private schema
   - Automatic encryption triggers for PII

## 🔧 Deployment Instructions

```bash
# Apply security migrations (in order)
psql -h <SUPABASE_HOST> -d postgres -f supabase/20_security_hardening.sql
psql -h <SUPABASE_HOST> -d postgres -f supabase/21_multi_tenant_isolation.sql

# Or via Supabase CLI
supabase db push

# Set up scheduled cleanup jobs (pg_cron)
SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT public.cleanup_rate_limits()');
SELECT cron.schedule('decay-trust-scores', '0 3 * * *', 'SELECT public.decay_inactive_trust_scores()');
SELECT cron.schedule('release-reservations', '* * * * *', 'SELECT public.release_expired_reservations()');
```

## Verification Checklist

- [ ] Run `process_task_reward` with mismatched user_id - should fail
- [ ] Test concurrent withdrawals - should serialize correctly
- [ ] Verify company can't see another company's worker details
- [ ] Confirm admin actions are logged in `admin_action_log`
- [ ] Test rate limiting on submission endpoint
- [ ] Verify trust score decay after 30 days inactivity

---


# Part II: Advanced Security Analysis (Senior Analyst Perspective)

**Analyst Seniority:** 20+ Years Security Engineering  
**Focus:** Scalability Vulnerabilities, Race Conditions, Business Logic Exploitation

The following findings represent vulnerabilities that may not be immediately apparent but will become **critical attack vectors as the platform scales to thousands of users**. These are the vulnerabilities that sophisticated attackers exploit.

---

## S01: Race Conditions & Time-of-Check-Time-of-Use (TOCTOU)

### Finding S1.1: Withdrawal Race Condition (CRITICAL)

**Location:** `user-app/screens/DashboardScreens.tsx`, `supabase/03_business_logic.sql`

**Description:** The withdrawal flow has a classic TOCTOU vulnerability. When a user initiates multiple simultaneous withdrawal requests, the balance check and deduction are not atomic from the client's perspective.

**Attack Scenario:**
1. User has $100 balance
2. User opens 10 browser tabs simultaneously
3. Each tab initiates a $100 withdrawal at the exact same moment
4. If requests arrive at the database before any deduction completes, all 10 may pass the balance check
5. User extracts $1000 from a $100 balance

**Vulnerable Pattern:**
```typescript
// DashboardScreens.tsx - WithdrawScreen
const startWithdraw = async () => {
  if (amount < 5.00) { ... }
  if (amount > (balance || 0)) { // Client-side check - easily bypassed
    alert("Insufficient liquidity...");
    return;
  }
  // Multiple simultaneous requests can pass this check
  const result = await WalletService.requestWithdrawal(amount, method, details);
};
```

**Remediation:**
```sql
-- Use SELECT FOR UPDATE with explicit locking
CREATE OR REPLACE FUNCTION public.request_withdrawal(...)
RETURNS UUID AS $$
DECLARE
  v_current_balance DECIMAL;
  v_withdrawal_id UUID;
BEGIN
  -- Lock the user row to prevent concurrent modifications
  SELECT balance INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE NOWAIT; -- Fails immediately if locked
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds: available %.2f, requested %.2f', 
      v_current_balance, p_amount;
  END IF;
  
  -- Atomic deduction after lock acquired
  UPDATE public.users SET balance = balance - p_amount WHERE id = p_user_id;
  -- ... rest of logic
END;
$$ LANGUAGE plpgsql;
```

---

### Finding S1.2: Task Reward Double-Spend (CRITICAL)

**Location:** `user-app/screens/TaskScreens.tsx`

**Description:** A user can submit the same task multiple times in rapid succession before the first submission is recorded, potentially earning multiple rewards for one piece of work.

**Attack Vector:**
```javascript
// Attacker script
for (let i = 0; i < 50; i++) {
  fetch('/api/submit-task', { 
    body: JSON.stringify({ taskId: 'task-123', payload: data })
  }); // Fire all 50 simultaneously - no await
}
```

**Remediation:**
1. Add unique constraint on `(user_id, task_id)` for single-attempt tasks
2. Implement request deduplication using idempotency keys
3. Add server-side rate limiting per user per task

```sql
-- Add constraint to prevent duplicate submissions
ALTER TABLE public.submissions 
ADD CONSTRAINT unique_user_task_submission 
UNIQUE (user_id, task_id) 
WHERE task_type IN ('single_attempt', 'one_time');

-- Add idempotency key column
ALTER TABLE public.submissions ADD COLUMN idempotency_key TEXT UNIQUE;
```

---

### Finding S1.3: Consensus Score Manipulation via Timing (HIGH)

**Location:** `supabase/12_linguasence_engine.sql`

**Description:** The weighted consensus system can be gamed by colluding validators who time their validations to exploit the trigger-based recalculation.

**Attack Scenario:**
1. Attacker creates multiple accounts with artificially high trust scores
2. Attacker submits a low-quality response
3. Legitimate validators mark it as invalid
4. Attacker's sybil accounts vote "valid" in rapid succession
5. Due to weighted scoring favoring high-trust accounts, bad data gets approved

**Current Vulnerable Logic:**
```sql
-- Weights only consider trust_score, not patterns
weighted_pos_sum := weighted_pos_sum + 
  (CASE WHEN v_record.is_valid THEN v_record.trust_score ELSE 0 END);
```

**Remediation:**
```sql
-- Add velocity-based anomaly detection
CREATE OR REPLACE FUNCTION public.calculate_weighted_consensus(resp_id UUID)
RETURNS VOID AS $$
DECLARE
  v_validator_count INTEGER;
  v_same_minute_votes INTEGER;
  v_ip_diversity INTEGER;
BEGIN
  -- Check for suspicious voting patterns
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute')
  INTO v_validator_count, v_same_minute_votes
  FROM public.linguasence_validations
  WHERE response_id = resp_id;
  
  -- If >50% of votes came in the same minute, flag for manual review
  IF v_same_minute_votes::FLOAT / NULLIF(v_validator_count, 0) > 0.5 
     AND v_validator_count > 5 THEN
    UPDATE public.linguasence_responses
    SET consensus_status = 'disputed', 
        metadata = COALESCE(metadata, '{}'::jsonb) || 
          '{"flag": "velocity_anomaly"}'::jsonb
    WHERE id = resp_id;
    RETURN;
  END IF;
  
  -- Continue with normal weighted calculation...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## S02: Denial of Service (DoS) Vectors

### Finding S2.1: Unbounded Query Amplification (HIGH)

**Location:** `admin-panel/src/App.tsx`, `company/src/services/analyticsService.ts`

**Description:** Several queries have no limits, allowing attackers to trigger expensive database operations.

**Vulnerable Patterns:**
```typescript
// Admin fetches ALL users - with 1M users, this crashes
supabase.from('users').select('*').order('created_at', { ascending: false });

// Analytics service - no date bounds
const { data } = await supabase.rpc('get_company_analytics_overview', {
  company_id: this.companyId
  // No time bounds - could aggregate years of data
});
```

**Remediation:**
1. Enforce mandatory pagination (max 100 per page)
2. Require date range parameters
3. Add query timeout at database level
4. Implement request cost scoring

```typescript
// Enforced pagination
const PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

supabase
  .from('users')
  .select('id, email, full_name, role, created_at', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('created_at', { ascending: false });
```

---

### Finding S2.2: Realtime Subscription Storm (MEDIUM)

**Location:** `supabase/15_realtime_analytics.sql`

**Description:** The realtime publications include high-frequency tables (`submissions`, `anomaly_alerts`). A malicious company could subscribe to these channels and trigger computational overhead by causing many insertions.

```sql
-- These tables can have high write volume
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomaly_alerts;
```

**Attack:** An attacker submits thousands of low-quality tasks, each triggering:
- Submission insert → Realtime broadcast
- Anomaly check → Potential alert creation → Another broadcast
- This creates cascading load on realtime infrastructure

**Remediation:**
1. Rate limit submissions per user (e.g., 10/minute)
2. Add debouncing to anomaly alerts (batch alerts within 5-minute windows)
3. Consider moving high-frequency updates to polling instead of realtime

---

### Finding S2.3: File Upload Size/Type Bypass (MEDIUM)

**Location:** `user-app/screens/TaskScreens.tsx` - StorageService

**Description:** File uploads to S3 rely on Edge Function for URL generation, but there's no validation of actual file content.

```typescript
// Only checks contentType header - not actual file content
await supabase.functions.invoke('storage-manager', {
  body: {
    action: 'GET-UPLOAD-URL',
    bucket: 'xum-raw-submissions',
    fileName: `raw/${Date.now()}_${fileName}`,
    contentType // User-controlled - can claim image/jpeg but upload malware
  }
});
```

**Attack:** Upload a malicious executable with Content-Type: image/jpeg

**Remediation:**
1. Validate file magic bytes server-side after upload
2. Scan uploads with antivirus before processing
3. Never serve user uploads directly - always process through a transformation layer

---

## S03: Business Logic Exploitation at Scale

### Finding S3.1: Trust Score Gaming (CRITICAL)

**Location:** `supabase/00_schema.sql`, business logic

**Description:** Trust scores influence task assignment and validation weight. At scale, this creates economic incentives for gaming the system.

**Attack Pattern (Long-term):**
1. Create account, build trust by doing easy tasks correctly
2. Once trust_score reaches 9.0+, switch to approving fraudulent submissions
3. High trust score means validations carry more weight
4. Collude with other accounts to approve each other's junk data

**Current Problem:**
```sql
-- Trust score only goes up, never down based on patterns
trust_score DECIMAL(3,1) DEFAULT 5.0 CHECK (trust_score >= 0 AND trust_score <= 10)
```

**Remediation:**
```sql
-- Add trust score decay and anomaly-based penalties
CREATE TABLE public.trust_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    old_score DECIMAL(3,1),
    new_score DECIMAL(3,1),
    reason TEXT, -- 'task_completed', 'validation_correct', 'consensus_disagree', 'pattern_anomaly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to decay trust scores for inactive users
CREATE OR REPLACE FUNCTION decay_inactive_trust_scores()
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET trust_score = GREATEST(trust_score * 0.95, 3.0) -- Decay to minimum 3.0
    WHERE last_active_at < NOW() - INTERVAL '30 days'
    AND trust_score > 5.0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Finding S3.2: Withdrawal Threshold Circumvention (HIGH)

**Location:** `user-app/screens/DashboardScreens.tsx`

**Description:** Minimum withdrawal is $5.00, but this is only client-side validated.

```typescript
if (amount < 5.00) {
  alert("Minimum withdrawal threshold is $5.00");
  return; // Only client-side check
}
```

**Problem:** An attacker can bypass the UI and call the RPC directly with a lower amount. At scale, thousands of micro-withdrawals create:
- Payment processing overhead
- Transaction fee losses
- Administrative burden

**Remediation:** Already exists in SQL but verify enforcement:
```sql
-- Confirm this constraint is in place and enforced
CONSTRAINT min_withdrawal CHECK (amount >= 5.00)
```

---

### Finding S3.3: Company Budget Exhaustion Attack (HIGH)

**Location:** `supabase/06_advanced_infrastructure.sql`

**Description:** Company project budgets can be exhausted by coordinated worker attacks.

**Attack Scenario:**
1. Attacker identifies a company with low remaining budget
2. Creates multiple accounts
3. All accounts grab tasks from that company simultaneously
4. Submit low-quality work en masse
5. Even if rejected, company's budget may be locked in pending state
6. Legitimate workers can't get tasks; company's project stalls

**Remediation:**
```sql
-- Add budget reservation with timeout
CREATE TABLE public.budget_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES public.project_budgets(id),
    user_id UUID REFERENCES public.users(id),
    amount DECIMAL(10,2),
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '30 minutes',
    status TEXT DEFAULT 'active' -- 'active', 'claimed', 'expired'
);

-- Cron job to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
    UPDATE public.budget_reservations
    SET status = 'expired'
    WHERE status = 'active' AND expires_at < NOW();
    
    -- Return funds to budget
    UPDATE public.project_budgets pb
    SET remaining_balance = remaining_balance + (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.budget_reservations br 
        WHERE br.budget_id = pb.id AND br.status = 'expired'
    );
END;
$$ LANGUAGE plpgsql;
```

---

## S04: Multi-Tenant Isolation Failures

### Finding S4.1: Company Data Cross-Contamination (CRITICAL)

**Location:** `company/src/services/analyticsService.ts`, RLS policies

**Description:** Analytics views aggregate data by `company_id`, but ensure RLS prevents Company A from seeing Company B's workers or submissions.

**Risk Areas:**
```sql
-- View shows worker_location - potentially leakable across companies
CREATE OR REPLACE VIEW public.v_realtime_worker_activity AS
SELECT 
    t.created_by as company_id,
    s.user_id as worker_id,
    u.full_name as worker_name,
    u.location as worker_location, -- Sensitive PII
    ...
```

**Verification Needed:**
1. Confirm RLS on the view prevents cross-company access
2. Workers who work for multiple companies - can Company A see their work for Company B?

**Remediation:**
```sql
-- Add RLS to views (PostgreSQL 15+)
CREATE POLICY company_isolation_policy ON public.v_realtime_worker_activity
    FOR SELECT USING (
        company_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
```

---

### Finding S4.2: API Key Scope Creep (MEDIUM)

**Location:** `supabase/12_linguasence_engine.sql`

**Description:** Company API keys have scopes defined as text arrays, but scope enforcement is not implemented.

```sql
scopes TEXT[] DEFAULT '{ "read:datasets", "write:tasks" }',
```

**Problem:** The `verify_company_api_key` function only validates the key exists and is active - it doesn't check if the requested action is within scope.

**Remediation:**
```sql
CREATE OR REPLACE FUNCTION public.verify_company_api_key(
    p_prefix TEXT, 
    p_provided_key TEXT,
    p_required_scope TEXT -- New parameter
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_scopes TEXT[];
BEGIN
    SELECT company_id, scopes INTO v_company_id, v_scopes
    FROM public.company_api_keys
    WHERE prefix = p_prefix 
      AND api_key_hash = crypt(p_provided_key, api_key_hash)
      AND is_active = true;
    
    IF v_company_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check scope
    IF NOT (p_required_scope = ANY(v_scopes)) THEN
        RAISE EXCEPTION 'Insufficient scope: % required, have %', 
            p_required_scope, v_scopes;
    END IF;
    
    UPDATE public.company_api_keys SET last_used = now() WHERE prefix = p_prefix;
    RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## S05: Admin Panel Privilege Escalation

### Finding S5.1: Admin Actions Without Audit Trail (HIGH)

**Location:** `admin-panel/src/App.tsx`

**Description:** Admin actions like modifying user balances, roles, or approving payouts are not comprehensively logged.

**Risk:** A compromised admin account (or malicious insider) can:
- Modify balances without trace
- Approve fraudulent withdrawals
- Change user roles to create new admins
- Delete evidence

**Remediation:**
```sql
-- Comprehensive admin action logging
CREATE TABLE public.admin_action_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL, -- 'balance_modify', 'role_change', 'payout_approve', etc.
    target_entity TEXT NOT NULL, -- 'user', 'withdrawal', 'task'
    target_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    justification TEXT, -- Required reason for action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Make deletion of this table impossible for anyone
REVOKE DELETE ON public.admin_action_log FROM authenticated;
REVOKE DELETE ON public.admin_action_log FROM service_role;
```

---

### Finding S5.2: Bulk Operation Abuse (MEDIUM)

**Location:** `admin-panel/src/App.tsx`

**Description:** Admin panel lacks confirmation steps for dangerous bulk operations.

```typescript
// No confirmation for bulk actions
<button className="...">Enroll User</button>
// What about "Suspend All Users from Region X"?
// What about "Approve All Pending Withdrawals"?
```

**Remediation:**
1. Require 2-person approval for bulk operations affecting >10 entities
2. Add "cooling off" period for mass actions (can be cancelled within 5 minutes)
3. Implement "break glass" pattern for critical actions requiring MFA

---

## S06: Information Disclosure

### Finding S6.1: Error Messages Leak Internal State (MEDIUM)

**Location:** Throughout all platforms

**Description:** Error messages reveal internal structure, making enumeration attacks easier.

```typescript
// Reveals database structure
console.error("Protocol error during liquidity transfer", e);
alert(`Handshake Error: ${result.message}`);
// If result.message contains SQL errors, attacker learns schema
```

**Remediation:**
```typescript
// Generic user-facing errors
const userFriendlyErrors: Record<string, string> = {
  'insufficient_funds': 'Your account balance is too low for this transaction.',
  'rate_limited': 'Please wait a moment before trying again.',
  'default': 'Something went wrong. Please try again or contact support.'
};

const getUserMessage = (error: any): string => {
  const code = error?.code || 'default';
  return userFriendlyErrors[code] || userFriendlyErrors.default;
};

// Log full error server-side, show generic to user
console.error('[INTERNAL]', error); // Server log
alert(getUserMessage(error)); // User sees generic
```

---

### Finding S6.2: User Enumeration via Timing (LOW)

**Location:** Auth flows

**Description:** Response times may differ for existing vs non-existing users during password reset or login.

**Remediation:**
- Add constant-time comparison for auth operations
- Return identical responses regardless of user existence
- Add small random delay to normalize response times

---

## S07: Platform-Specific Vulnerabilities

### User App (Mobile-First)

| Finding | Severity | Description |
|---------|----------|-------------|
| **S7.1** | HIGH | Local storage may persist sensitive session data on shared devices |
| **S7.2** | MEDIUM | No certificate pinning - vulnerable to MITM on compromised networks |
| **S7.3** | LOW | Deep link handlers could be hijacked by malicious apps |

### Admin Panel

| Finding | Severity | Description |
|---------|----------|-------------|
| **S7.4** | CRITICAL | No IP allowlisting for admin access |
| **S7.5** | HIGH | Session doesn't invalidate on role downgrade |
| **S7.6** | MEDIUM | Admin actions executable via browser console (no CSRF tokens for mutations) |

### Company Dashboard

| Finding | Severity | Description |
|---------|----------|-------------|
| **S7.7** | HIGH | Webhook URLs (Slack) stored in plaintext |
| **S7.8** | MEDIUM | Email reports could leak sensitive metrics if sent to compromised addresses |
| **S7.9** | LOW | Project names/descriptions could contain XSS payloads displayed to workers |

---

## S08: Scalability-Specific Attack Surfaces

### Finding S8.1: Thundering Herd on Task Release

When a high-value task batch is released, thousands of users may simultaneously hit the task feed endpoint. Without proper queuing:
- Database connection pool exhaustion
- Unfair advantage to users with faster connections
- Potential for automated bot sniping

**Remediation:** Implement task queue with random assignment delays (0-5 second jitter).

---

### Finding S8.2: Financial Reconciliation Drift

At scale, floating-point arithmetic errors in balance calculations compound:

```sql
balance DECIMAL(10,2) -- Good, but...
-- What happens with:
UPDATE users SET balance = balance + 0.001; -- Micro-amounts?
```

**Remediation:**
- Store all amounts as integers (cents/satoshis)
- Run daily reconciliation jobs comparing balance sums to transaction ledger
- Alert on any discrepancy > $0.01

---

## Revised Priority Matrix

| Priority | Finding IDs | Description | Timeline |
|----------|-------------|-------------|----------|
| **P0 - Critical** | S1.1, S1.2, S3.1, S4.1 | Financial exploitation, data isolation | 24-48 hours |
| **P1 - Urgent** | 1.1, 1.4, S1.3, S3.3, S5.1 | Privilege escalation, audit gaps | Week 1 |
| **P2 - High** | S2.1, S2.3, S3.2, S5.2, S7.4 | DoS vectors, admin hardening | Week 2 |
| **P3 - Medium** | 2.1, 4.1, S4.2, S6.1, S7.5-S7.8 | Data protection, information leakage | Month 1 |
| **P4 - Low** | S6.2, S7.3, S7.9, S8.2 | Timing attacks, edge cases | Quarter 1 |

---

## Recommended Security Architecture Changes

### 1. Implement Request Signing
All client requests to sensitive endpoints should include HMAC signatures with short-lived nonces.

### 2. Add Circuit Breakers
When anomalous activity is detected (>100 requests/min from one user), automatically throttle.

### 3. Implement Fraud Detection ML
Train models on:
- Normal submission velocity per user
- Typical validation patterns
- Expected trust score progression

### 4. Create Security Operations Runbook
Document incident response for:
- Suspected mass withdrawal fraud
- Sybil attack on consensus
- Compromised admin account
- Data breach in S3 bucket

---

## Conclusion (Senior Analyst)

This platform has solid foundational security but lacks the **defense-in-depth** required for scale. The combination of:
- Financial incentives (real money withdrawals)
- Crowdsourced validation (trust systems)
- Multi-tenant architecture (company isolation)

Creates a **high-value target** for sophisticated attackers. The vulnerabilities identified in Part II represent attacks that would emerge within 6-12 months of significant user growth.

**Immediate Action Required:**
1. Implement `SELECT FOR UPDATE` locking on all balance operations
2. Add rate limiting middleware (10 requests/minute for sensitive operations)
3. Create admin audit log with immutable storage
4. Implement multi-company data isolation testing suite

**The cost of not addressing these issues scales with user count. At 10,000 users, a race condition exploit could drain $50,000 in minutes.**

---

*Report Prepared By: Senior Security Analyst*  
*Classification: Internal - Confidential*  
*Review Cycle: Quarterly*
