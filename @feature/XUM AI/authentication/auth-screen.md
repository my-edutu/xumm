# Feature: Multi-Mode Auth Screen (Terminal Access)

## 📝 The Journey
For the login/signup experience, I wanted a "Terminal" aesthetic—dark, focused, and high-tech. Instead of separate pages, I used a sleek toggle system that slides between Login and Sign Up modes.

### Engineering Decisions
- **Shared Form Infrastructure**: The form dynamically expands its fields (Full Name, Age, Password Confirm) based on the `mode` state.
- **Cyber-Terminal UI**: 
    - Floating labels using `text-[10px]` uppercase tracking.
    - Custom input wrappers with Material Icons as prefixes.
    - Password visibility toggle (`visibility`/`visibility_off`).
- **Google OAuth Integration**: A prominent, branded button for social authentication.

## 💻 Implementation Details
- **File**: `user-app/screens/AuthScreens.tsx`
- **Component**: `AuthScreen`
- **Methods**: `handleSubmit` (Mocked for now to navigate to HOME).

### Security Features
- Signup requires confirmation of the "Access Key" (password).
- Age validation built into the numeric input (`min="13"`).
- Password visibility state is isolated to the component.

## 🧪 Verification
- [x] Seamless switching between Login and Sign Up.
- [x] Password toggle correctly reveals/hides text.
- [x] Submit button triggers navigation to Dashboard.
