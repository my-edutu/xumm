# Contributing to XUM AI

We welcome contributions to the XUM AI codebase. This document details the standards and workflows for developing features for the platform.

## 🛠 Development Environment

### Setup
1.  **Node Version:** Ensure you are running Node.js 18 or higher.
2.  **Package Manager:** We use `npm`.
3.  **Env Variables:** Copy `.env.example` to `.env.local` and populate the Supabase keys.
    *   *Note:* If you do not have Supabase keys, the app handles this gracefully in `supabaseClient.ts` by using placeholder values, but backend features will not work.

### Prototype Mode
Currently, the application is in **Prototype Mode**.
-   **Authentication:** Real authentication is bypassed. `UserContext.tsx` provides a `DEMO_USER` by default.
-   **Data:** Most screens use hardcoded local state (e.g., `useState` with array literals) instead of fetching from the database.
-   **Goal:** When building new UI, continue using mock data. When implementing logical backends, ensure you create a path to replace mocks with `supabase` calls.

## 🎨 Styling Guidelines

We use **NativeWind** (TailwindCSS for React Native).

-   **Utility First:** Use utility classes (`className="flex-1 bg-white"`) rather than `StyleSheet.create`.
-   **Dark Mode:** Always implement dark mode variants using the `dark:` prefix (e.g., `bg-white dark:bg-slate-900`).
-   **Colors:** Use the semantic colors defined in `tailwind.config.js` or the standard slate/zinc palettes for neutrals. avoiding hardcoded hex values in components where possible to support the theming engine.

## 🧩 Component Structure

### New Screens
1.  Register the screen name in `types.ts` enum `ScreenName`.
2.  Create the component in the appropriate file in `screens/` (or a new file if it's a major new module).
3.  Add the case to the `switch` statement in `App.tsx`.

### Reusable Components
-   Place atomic components in `components/`.
-   If a component is used in multiple screens (e.g., a specific Card style), extract it.
-   **Do not** bloat `Shared.tsx` further. Create new files (e.g., `components/Cards.tsx`).

## 🧪 Testing

-   **Manual Testing:** Test on both Web (`npm run dev`) and Mobile (Expo Go) as platform differences in styling can occur.
-   **Responsiveness:** Ensure UI scales from mobile phone width (320px) to Desktop (1024px+). The `App.tsx` container handles max-width, but internal components must be flexible.
