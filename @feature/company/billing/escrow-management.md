# Feature: Billing & Escrow Management

## 📝 The Journey
The financial heart of the Company Portal. Unlike retail apps, XUM AI uses an "Escrow Model" where funds are locked before tasks are released to the network.

### Engineering Decisions
- **Credit Balance System**: Shows a massive primary balance for "Available Credits," which is the only pool that can trigger task releases.
- **Transaction Audit Log**: A granular list of every credit purchase and every "Node Disbursement" (when a task is paid out to a worker).
- **Invoice Generation**: Integrated automated PDF invoice generation (Mocked) for accounting and compliance.
- **Subscription Management**: Support for tiered access plans that provide better analytics and lower marketplace fees.

## 💻 Implementation Details
- **File**: `company/src/pages/Billing.tsx`
- **Component**: `Billing()`.
- **Services**: Connects to `billingService.ts` for financial handshakes.

### Ledger Categories
- **Deposit**: Funding the escrow.
- **Task Payout**: Automated deduction when a worker's submission is verified.
- **Marketplace Purchase**: One-time deduction for dataset acquisition.

## 🧪 Verification
- [x] Current credit balance reflects all historically verified transactions.
- [x] "Top Up" modal correctly allows selection of payment method.
- [x] Status colors (Green for Paid, Red for Overdue) map accurately.
