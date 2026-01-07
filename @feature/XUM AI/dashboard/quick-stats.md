# Feature: Dynamic Dashboard Stats & Network Status

## 📝 The Journey
Instead of simple numbers, I created "Information Nodes" for the dashboard. The goal was to make financial data feel tactile and the "Network Status" feel like being part of a global grid.

### Engineering Decisions
- **Tactile Cards**: Used `active:scale-95` on stat cards so users get physical feedback when tapping to view their wallet.
- **Visual Encoding**: 
    - **Blue/Wallet icon**: Completed earnings.
    - **Orange/Hourglass icon**: "Pending" funds (funds safe in escrow).
- **Network Status Card**: 
    - Full-width design with a background `public` logo at `opacity-10`.
    - Integrated "Operational" status with an Emerald color pulse to signify system health.
    - "Current Node" counter (#142) to reinforce the decentralized identity.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Elements**: Wallet Card, Pending Card, Network Status Banner.

### Styling Logic
- Cards use `surface-light`/`surface-dark` classes to adapt to the user's theme.
- `theme-card-gradient` applied to the Network card for a high-contrast, premium look.

## 🧪 Verification
- [x] Tap on "Earned" card navigates to Wallet.
- [x] Network Status card scales correctly on Tablet/Landscape mode.
- [x] Theme colors switch instantly between Midnight/Emerald/Crimson.
