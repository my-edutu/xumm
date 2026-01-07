# Feature: Business Ledger & Company Compliance

## 📝 The Journey
The Business Ledger is where we manage the "Supply Side" (Companies) of the marketplace. It's a high-trust interface for ensuring that all data purchases and escrow deposits are accounted for.

### Engineering Decisions
- **Ledger Item Traceability**: Each `LedgerItem` shows the company, amount, date, and "Transaction Type" (Deposit vs. Withdrawal).
- **Billing Approval Handshake**: When a company tops up their credit via bank transfer, an admin must manually verify and "Approve" the billing request in the `BusinessLedger`.
- **Revenue Visualization**: Integrated Pie Charts showing the distribution of "Approved" vs. "Pending" vs. "Rejected" capital.
- **Project Cost Auditing**: Admins can drill down into a company's specific project to see exactly where the credits are being spent (e.g., Worker Rewards vs. XUM Fees).

## 💻 Implementation Details
- **File**: `admin-panel/src/App.tsx`
- **Component**: `BusinessLedger()`.
- **Logic**: `handleApproveBilling()` updates the `billing_requests` table and increments the `company_wallets` balance.

### Financial Vectors
- **Net Protocol Revenue**: Total fees captured by XUM AI.
- **Escrow Liquidity**: Total funds currently locked in company wallets.
- **Pending Deposits**: Capital waiting for admin verification.

## 🧪 Verification
- [x] Approving a billing request correctly triggers the balance increment.
- [x] Status colors for ledger items (Success/Warning) reflect the transaction state.
- [x] Empty state appears correctly when no pending billing requests exist.
