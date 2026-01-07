# Feature: Navigation Framework (Global Handshake)

## 📝 The Journey
The navigation needed to be invisible yet omni-present. I chose a "Mobile-First" Bottom Nav and a clean Header system that emphasizes the "current protocol" (screen title).

### Engineering Decisions
- **Floating Bottom Nav**: Instead of a flat bar, I used a `rounded-[2.5rem]` container with a massive `z-50` index to make it feel like an overlay.
- **Glass-Morph Tab Highlighting**: The active tab uses a `bg-primary/10` and `text-primary` pulse to show user placement.
- **Micro-Transitions**: Switching between Home, Market, and Wallet uses an elegant scale and color transition on the icons.
- **Universal Header**: A consistent header with a "Back" button for deep-level screens (like Task Details) and optional "Right Action" slots for things like "More" or "Refresh".

## 💻 Implementation Details
- **File**: `user-app/components/Shared.tsx`
- **Components**: `BottomNav`, `Header`.
- **Props**: `currentScreen`, `onNavigate`, `isDarkMode`.

### Navigation Nodes
- `HOME`: Main dashboard.
- `TASK_MARKETPLACE`: The exchange.
- `LINGUASENSE`: Specialized language missions.
- `WALLET`: Currency management.
- `PROFILE`: Settings and stats.

## 🧪 Verification
- [x] Header title updates correctly on screen transition.
- [x] Bottom Nav remains anchored at the bottom of the viewport.
- [x] Content padding (`pb-32`) prevents text from hiding behind the nav bar.
