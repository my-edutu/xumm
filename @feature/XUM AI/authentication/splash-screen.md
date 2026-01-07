# Feature: Splash Screen (Initial Handshake)

## 📝 The Journey
The Splash Screen was designed to be the "wow" moment for the user. Instead of a static logo, I implemented a particle system that feels alive. The goal was to symbolize the "decentralized intelligence" of XUM AI, where individual nodes (particles) come together to form a cohesive system.

### Engineering Decisions
- **Particle System**: I used 800 particles that scatter randomly initially.
- **Forming Logic**: On mount, a timer triggers a "forming" phase where particles transition from random coordinates to specific coordinates mapped to the letters "X-U-M A-I".
- **Dynamic Gradients**: The background is a vertical gradient representing the core color palette (Blue to Emerald to Deep Navy).
- **Navigation Handshake**: The screen automatically navigates to `ONBOARDING` after 8.2 seconds, or immediately if the user taps anywhere (power user shortcut).

## 💻 Implementation Details
- **File**: `user-app/screens/AuthScreens.tsx`
- **Component**: `SplashScreen`
- **Coordinate Map**: `LOGO_MAP` (Manual mapping of X/Y points for the XUM AI letters).

### Visual State Transitions
1. `scattered`: Random distribution across the viewport.
2. `forming`: Particles glide toward their target points using `transition-all`.
3. `stable`: Solid text fades in over the particles for clarity.

## 🧪 Verification
- [x] Particles move smoothly on both mobile and desktop views.
- [x] Click-to-skip functionality confirmed.
- [x] Automatic redirect triggers after the sequence finishes.
