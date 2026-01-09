# XUM AI Architecture Guide

This document outlines the technical architecture of the XUM AI application, providing developers with a high-level understanding of how the system is structured and how data flows through the application.

## 🏗 System Overview

XUM AI is built as a **cross-platform application** using React Native (Expo) for mobile targets and Vite for web distribution. The application interacts with a **Supabase** backend for authentication, data persistence, and edge functions.

### Core Technologies
-   **Frontend Framework:** React 19 / React Native 0.81 (via Expo SDK 54)
-   **Web Bundler:** Vite 6.2 (for highly optimized web builds)
-   **Styling:** NativeWind (TailwindCSS for React Native)
-   **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
-   **Navigation:** Custom state-based navigation (simulating a stack) located in `App.tsx`.

## 📂 Project Structure

### `screens/`
The application logic is primarily divided into screen bundles:
-   **`AuthScreens.tsx`**: Handles the user entry flow: Splash, Onboarding, Login, Registration, OTP, and Forgot Password.
-   **`DashboardScreens.tsx`**: Contains the core "Hub" screens:
    -   `HomeScreen`: Main dashboard with daily streaks and quick actions.
    -   `WalletScreen`: Financials, transaction history.
    -   `ProfileScreen`: User stats, level info.
    -   `WithdrawScreen`: Cash out logic.
-   **`TaskScreens.tsx`**: The "Work" center of the app:
    -   `TaskMarketplaceScreen`: List of available tasks.
    -   `MediaCaptureScreen`: Generic camera handling.
    -   `CaptureAudioScreen` / `CaptureVideoScreen`: Specialized capture flows.
    -   `LinguasenseScreen`: Specialized language tasks.
-   **`AdminScreens.tsx`**: Restricted area for platform administrators (User Management, Task Moderation).
-   **`CompanyLinguasenseDashboard.tsx`**: The client-facing portal for companies to manage data campaigns.

### `components/`
-   **`Shared.tsx`**: Home to the core layout components:
    -   `Header`: A reusable top bar with back navigation and optional actions.
    -   `BottomNav`: The persistent bottom tab bar. *Note: This component currently also handles the Theme Switching logic and Settings Modal.*

### `contexts/`
-   **`UserContext.tsx`**: A React Context provider that manages the global user state (`user`, `profile`).
    -   *Current State:* It is currently in **Prototype Mode**, serving mock data (`DEMO_USER`). Authentication calls are simulated.

## 🧭 Navigation & State Management

### Navigation
Navigation is handled centrally in `App.tsx` using a simple state variable `currentScreen`.
```typescript
const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.SPLASH);
```
There is no use of `react-navigation` library; instead, a large `switch` statement in `App.tsx` renders the appropriate component based on the state. This simplifies the web/mobile bridge but requires careful management of the back stack if complex flows are added.

### Theming
The app implements a dynamic theming system:
1.  **Web:** Uses CSS Variables injected into the `document.head` (see `App.tsx`).
2.  **Native:** Dependencies on `nativewind` allow for `className` usage.
3.  **Themes:** Defined in `THEMES` array in `App.tsx` (Midnight, Emerald, Solar, etc.).

## 🔌 Backend Integration (Supabase)

The connection is established in `supabaseClient.ts`.
-   It attempts to read environment variables from both `import.meta.env` (Vite) and `process.env` (Expo).
-   Includes a robust fallback mechanism (`getValidUrl`) to prevent app crashes if keys are missing during early development.

## 🔮 Future Architecture Improvements
1.  **Navigation:** Migrate to `expo-router` for better deep linking and native stack behavior.
2.  **Context:** Break `UserContext` into `AuthContext` and `DataStore` for better separation of concerns.
3.  **Components:** Atomic design implementation for creating smaller, more reusable UI tokens (buttons, cards) outside of `Shared.tsx`.
