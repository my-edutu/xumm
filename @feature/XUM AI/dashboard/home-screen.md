# Feature: Home Screen (Command Center)

## 📝 The Journey
The Home Screen is the "landing pad" for every session. I wanted it to feel like a high-end financial app mixed with a sci-fi interface. Everything is built on a `min-h-screen` container that supports seamless dark/light mode transitions.

### Engineering Decisions
- **Sticky Blur Header**: The header uses `backdrop-blur-md` and `sticky top-0` to keep the user's name and "Welcome" message visible while scrolling through tasks.
- **Micro-Animations**: I added `animate-fade-in` to sections so they slide into view softly rather than popping in.
- **Sectioned Hierarchy**: 
    - **Top**: Financial & Network Stats.
    - **Middle**: High-value "XUM Judge" tasks.
    - **Bottom**: "Daily Missions" for quick engagement.
- **Adaptive Layout**: Used Tailwind's responsive prefixes (`md:grid-cols-2`, `md:px-12`) to ensure the desktop view feels as purposeful as the mobile view.

## 💻 Implementation Details
- **File**: `user-app/screens/DashboardScreens.tsx`
- **Component**: `HomeScreen`
- **Dependencies**: Uses `UserProvider` for profile data and `BottomNav` for persistent navigation.

## 🧪 Verification
- [x] Correct user first name extraction (`profile?.full_name?.split(' ')[0]`).
- [x] Responsive grid switches from 2 to 4 columns for stats on larger screens.
- [x] Scroll behavior for long lists of tasks.
