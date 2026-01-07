# Feature: Multi-Theme Engine (Midnight / Emerald / Crimson)

## 📝 The Journey
One size doesn't fit all. I built a theme system that allows users to change the "Core Protocol Color" of the entire app. This isn't just a color change; it changes the mood and "Energy" of the app.

### Engineering Decisions
- **Dynamic CSS Variables**: The theme system maps an ID (Midnight/Emerald/Crimson) to a set of color hexes (primary, bg, surface). These are injected into the DOM via a style object.
- **Gradient Mapping**: Every theme includes a unique `cardGradient` (135deg) used for high-impact cards like the Wallet and Network Status.
- **Theme Selection UI**: Integrated into the "More" tab (Bottom Nav), providing a quick-switch toggle between the different protocol modes.
- **Persistence**: (Integration in progess) The goal is to save the user's preferred "Protocol ID" to their profile.

## 💻 Implementation Details
- **File**: `user-app/App.tsx`
- **Objects**: `THEMES` array.
- **State**: `activeThemeId`.

### Theme Profiles
- **Midnight (Primary)**: Classic deep tech blue.
- **Emerald**: Growth/Prosperity focused green.
- **Crimson**: High-energy/Urgent focused red.

## 🧪 Verification
- [x] Primary buttons change color instantly on theme switch.
- [x] Gradient backgrounds in cards transition smoothly.
- [x] App background color stays consistent within its theme group.
