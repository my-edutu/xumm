# Payment Infrastructure V2 - Dynamic Financial Systems

This document outlines the v2 implementation of XUM AI's financial system, focusing on security, atomicity, and organizational liquidity.

## Core Components

### 1. Company Wallets (`company_wallets`)
All organizations maintain a centralized wallet that tracks:
- **Available Balance**: Funds ready to be allocated to projects.
- **Pending Balance (Escrow)**: Funds locked for active data annotation tasks.
- **Total Deposited/Spent**: Lifetime financial metrics.

### 2. Immutable Ledger (`financial_ledger`)
Every financial movement is recorded in a consolidated ledger. This serves as the "source of truth" for audits and reconciliation.
Types include: `deposit`, `withdrawal`, `escrow_lock`, `escrow_release`, `revenue_share`, and `data_purchase`.

### 3. Project Budget Integration
Budgets are no longer just "numbers". They are now backed by wallet escrow:
1. When a budget is created, funds are moved from `available` to `pending`.
2. When a worker submission is approved, funds are released from `pending` and recorded as `total_spent`.

### 4. Worker Revenue Sharing
Dataset sales trigger a weighted distribution logic:
- Payments are queued in `worker_payout_queue`.
- Shares are calculated based on the worker's contribution weight to the specific dataset batch.
- Admins review and process these via the **Payout Vault** in the Admin Panel.

### 5. Multi-Currency Infrastructure
- **Exchange Rates**: System tracks USD-relative rates for global currencies (NGN, GHS, KES, ZAR, etc.).
- **Conversion Utility**: Internal SQL function `convert_currency` handles all rate calculations for UI display and payouts.

## Security Features
- **Idempotency**: `payment_events` table ensures payment gateway webhooks are only processed once.
- **Atomic Deposits**: `handle_company_deposit` RPC ensures wallet and ledger updates are all-or-nothing.
- **RLS Enforcement**: Strict database-level policies ensure companies only see their own wallets and workers only see their own payouts.

## Analytical Power
The system provides several real-time views for platform monitoring:
- `vw_daily_financial_performance`: Daily snapshot of platform health.
- `vw_company_spending_summary`: Risk monitoring for corporate accounts.
- `vw_worker_earnings_report`: Contributor value analysis.
- `vw_escrow_reconciliation`: Verification of system-wide liquidity.

## Technical Roadmap
- [x] Wallet & Ledger Schema
- [x] Atomic Deposit Logic
- [x] Worker Share Distribution
- [x] Budget-Wallet Sync
- [x] Reporting Views
- [ ] Automated External Payout Execution (Stripe/Paystack API Integration)
- [ ] Financial Reconciliation Agent (AI)
