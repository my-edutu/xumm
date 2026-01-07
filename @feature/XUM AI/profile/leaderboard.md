# Feature: Elite Leaderboard (Global Nodes)

## 📝 The Journey
Gamification is key to retention. I wanted the Leaderboard to feel like a high-stakes "Network Rankings" table rather than a score screen from a game.

### Engineering Decisions
- **The Performance Protocol**: The user's own ranking is highlighted at the top in a massive `bg-primary/10` card, showing their `#142` position and "Top 5%" status.
- **Elite Node Cards**: Top performers get a distinctive card with a large initial avatar and an "Accumulated XP" counter.
- **Focus States**: I added a "ring-4 ring-primary/10" effect for the user's entry within the list to make them stand out from the crowd.
- **Visual Ranker**: Ranks 1-3 use the `text-primary` color to denote "Gold, Silver, Bronze" significance without using tacky icons.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Component**: `LeaderboardScreen`.

### Layout Architecture
- Top: Personal Rank & Global Percentile.
- Bottom: Infinite list of "Elite Nodes."

## 🧪 Verification
- [x] Initial avatars generate correctly from names.
- [x] XP counters reflect the total "Linguistic Output."
- [x] Responsive layout stacks correctly on mobile.
