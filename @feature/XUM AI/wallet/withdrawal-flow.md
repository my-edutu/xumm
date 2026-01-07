# Feature: Withdrawal System (Liquidity Transfer)

## 📝 The Journey
Moving money out of the system is the most secure operation. I engineered this as a "Handshake Protocol" with three distinct verification phases to ensure the user feels their funds are safe.

### Engineering Decisions
- **Verifying States**:
    1. `processing`: "Initializing handshake protocol..."
    2. `verifying`: "Securing ledger entry..." (Simulates a security check)
    3. `success`: "Complete" (Visual celebration)
- **Minimum Thresholds**: Added a hard check for a $5.00 limit. If the user tries to withdraw less, the protocol is rejected alerting the user.
- **Liquidity Check**: The system validates that the withdrawal amount does not exceed the `profile.balance` before initiating the RPC call.
- **Sleek Input**: A giant currency input that uses `outline-none` and `focus:ring-8` to create a bold, immersive input experience.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Component**: `WithdrawScreen`.
- **Service**: `WalletService.requestWithdrawal`.

### Error Handling
- Handshake errors (rejected by the network/Supabase) are caught and displayed as "Handshake Error" to the user.

## 🧪 Verification
- [x] $5.00 minimum threshold block works.
- [x] Balance-exceeded block works.
- [x] Emerald checkmark animation triggers post-verification.
