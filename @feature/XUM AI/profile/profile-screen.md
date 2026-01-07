# Feature: User Identity & Node Stats (Profile)

## 📝 The Journey
The Profile is where the contributor sees their "Full Identity." I wanted it to feel like a digital ID card for a high-tech specialized worker.

### Engineering Decisions
- **Neural Avatar**: A circular avatar centered in a flex row (on desktop) that generates initials from the `profile.full_name`.
- **Level Badge**: A specialized "L{level}" badge anchored to the bottom-right of the avatar with a high-contrast border.
- **Node Identifier**: Using the last 4 digits of the user's UUID (e.g., `#0000`) as their "Contributor Node ID" to reinforce the decentralized theme.
- **Precision Metrics**: Added a "Precision" stat (98.4%) to show the quality of their work, emphasizing that accuracy is as important as quantity.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Component**: `ProfileScreen`.

### Key Metrics Tracked
- **Earnings**: Total processed liquidity.
- **Precision**: Algorithmic accuracy score.
- **Level**: Tier reflecting total XP.

## 🧪 Verification
- [x] Level badge scales with the avatar icon.
- [x] Contributor ID reflects actual database ID fragment.
- [x] Initials logic handles multi-word names correctly.
