# Feature: Wallet Terminal (The Treasury)

## 📝 The Journey
The Wallet isn't just a list of numbers; it's a "Visual Ledger." I used a deep indigo/blue card with a massive background `account_balance_wallet` icon to make it feel solid and trustworthy.

### Engineering Decisions
- **Balance Prominence**: I used `text-9xl` for the balance (on desktop) to emphasize the utility of the user's earned liquidity.
- **Glassmorphism in Controls**: The primary actions ("Withdraw", "Add") are housed in high-contrast blocks with `backdrop-blur-md` and `bg-white/20` to differentiate them from the task-related UI.
- **Transactional Feed**: Instead of a "list," I designed a feed of "Handshakes." Each entry shows its status, icon, date, and localized amount.
- **Dynamic Coloring**: Income is marked with `emerald-500`, while withdrawals remain neutral, representing a standard protocol transfer.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Component**: `WalletScreen`.
- **Data Hook**: Pulls `balance` and `history` props from the `AppContent` state.

### visual Hierarchy
1. **The Vault**: Giant card showing total available funds.
2. **Action Bar**: Immediate access to liquidity withdrawal.
3. **The Ledger**: Detailed history of every network handshake.

## 🧪 Verification
- [x] Balance matches the count in the `Home` and `Profile` screens.
- [x] Clicking "Withdraw" correctly pushes the `WITHDRAW` screen state.
- [x] Transaction history scrolls independently of the main wallet card.
