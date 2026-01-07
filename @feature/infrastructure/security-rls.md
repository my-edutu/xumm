# Feature: Security & Multi-Tenant Isolation (RLS)

## 📝 The Journey
In a system handling both corporate dataset secrets and user financial data, security is not an option—it's the core. I leveraged Supabase Row Level Security (RLS) to build a "Defensive Perimeter" around every table.

### Engineering Decisions
- **Zero-Trust Policies**: By default, no row is visible. I built explicit `ALLOW` policies for every user role.
- **Company Isolation**: Used a `company_id` check on every project and task to ensure Company A can never even "see" the existence of Company B's data.
- **Immutable Audit Logs**: implemented `admin_action_log` and `system_event_log` tables with `INSERT-ONLY` policies, ensuring that no one (not even an admin) can delete their trail.
- **Server-Side Verification (RPC)**: sensitive operations like `request_withdrawal` are handled via PostgreSQL functions, where we can re-verify permissions server-side before execution.

## 💻 Implementation Details
- **Files**: `supabase/02_rls_policies.sql`, `supabase/20_security_hardening.sql`, `supabase/21_multi_tenant_isolation.sql`.

### Policy Framework
- **Worker Policy**: Can see active tasks, but only their own submissions and wallet.
- **Company Policy**: Full control over their own projects; zero access to other companies.
- **Admin Policy**: Global read-only access with specific "Authorize" write permissions.

## 🧪 Verification
- [x] Direct API calls to unauthorized rows return 404/Access Denied.
- [x] `jwt` claims correctly identify user role and company affiliation.
- [x] Multi-tenant isolation verified via cross-account testing.
