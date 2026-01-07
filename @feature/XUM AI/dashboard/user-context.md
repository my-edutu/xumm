# Feature: User Context & Global State

## 📝 The Journey
State management can get messy, so I centralized everything related to the user in a `UserProvider`. This acts as the project's "Single Source of Truth," handling authentication persistence and real-time profile updates.

### Engineering Decisions
- **Supabase Integration**: The context automatically hooks into `supabase.auth.onAuthStateChange`. When a user logs in or out, the entire app state reacts instantly.
- **Automatic Profile Fetching**: On login, a `fetchProfile` call pulls balance, level, and XP from the Supabase `users` table.
- **Refresh Mechanism**: I exposed a `refreshProfile` function so other components (like Task Submission) can force a balance update without a full page reload.
- **Type Safety**: Defined a strict `UserProfile` interface to prevent "undefined" errors across the UI.

## 💻 Implementation Details
- **File**: `user-app/contexts/UserContext.tsx`
- **Provider**: `UserProvider`
- **Hook**: `useUser()`

### Global State Keys
- `user`: Raw Supabase Auth object.
- `profile`: Custom app-specific data (Balance, XP, Role).
- `loading`: Boolean to prevent UI rendering before data is ready.

## 🧪 Verification
- [x] Balance updates across all screens when `refreshProfile` is called.
- [x] Auto-redirect/re-render on Sign Out.
- [x] Session persistence confirmed on page refresh.
