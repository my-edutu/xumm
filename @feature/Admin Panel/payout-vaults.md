# Feature: Payout Vaults & Financial Protocol

## 📝 The Journey
The most sensitive part of the system is the Payout Vault. I built this as a high-security manual review gate where admins must "Authorize" every liquidity transfer from the protocol to a user's external account.

### Engineering Decisions
- **Batch Processing**: Instead of one-by-one, admins can review "Vaults" organized by day or by payment method (Paypal, Crypto).
- **Security Checksums**: Each payout request includes a "Handshake History" showing if the user's recent tasks were high-quality. If the success rate is too low, the admin gets a `ShieldAlert` notification.
- **Immutable Ledger Entry**: Every approval triggers a simultaneous update to the `user_ledger` and the `protocol_burn` logs.
- **Fraud Flags**: Automated flagging of suspicious withdrawal amounts or rapid-succession requests.

## 💻 Implementation Details
- **File**: `admin-panel/src/App.tsx`
- **Component**: `PayoutVaults()`.

### Payout Lifecycle
1. **Pending**: User requested withdrawal.
2. **Reviewing**: Admin analyzing user history.
3. **Authorized**: Funds released to external processor.
4. **Settled**: Handshake complete.

## 🧪 Verification
- [x] "Approve" button triggers the `handleApprove` handshake logic.
- [x] Total pending payout sum updates in real-time as items are processed.
- [x] User detail drill-down works from the payout list.
