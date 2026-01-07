# Feature: Financial & Payment Infrastructure (V2)

## 📝 The Journey
Handling money requires the highest level of precision. I engineered a "Double-Entry" ledger system that ensures every cent in the XUM ecosystem is accounted for.

### Engineering Decisions
- **The Escrow Engine**: Built a `company_wallets` system where credits are "Bonded" to a project. A worker is only paid from this bonded pool after their work is verified.
- **Automated Revenue Distribution**: implemented `17_worker_revenue_distribution.sql` to handle the split between the Worker (90%) and the XUM Protocol Fee (10%) automatically on every verified submission.
- **Multi-Currency Support**: Engineered a schema that supports multiple localized currencies while maintaining a "System Master" balance in USD.
- **Idempotent Transactions**: Every payout request uses a unique `idempotency_key` to prevent "Double Spend" attacks.

## 💻 Implementation Details
- **Files**: `supabase/03_business_logic.sql`, `supabase/16_payment_infrastructure_v2.sql`, `supabase/20_automated_payout_infrastructure.sql`.

### Financial logic
- **`request_withdrawal` RPC**: Validates balance, logs the request, and triggers an admin alert.
- **`process_task_reward` RPC**: atomic transaction that deducts from company escrow and adds to user balance.

## 🧪 Verification
- [x] Race conditions on withdrawals prevented via Postgres row locking.
- [x] Ledger balances match the sum of all transaction logs perfectly.
- [x] Fee calculations reflect the correct 90/10 protocol split.
