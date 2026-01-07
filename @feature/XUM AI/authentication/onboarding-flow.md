# Feature: Onboarding Flow (User Calibration)

## 📝 The Journey
The onboarding isn't just a tutorial; it's a calibration of user expectations. I wanted to move away from boring lists and use "Dynamic Cards" that float over deep gradients.

### Engineering Decisions
- **Modular Slides**: Each slide is an object in a `slides` array containing title, body, gradient, and floating icons.
- **Glassmorphism**: Icons are wrapped in `backdrop-blur-2xl` containers to maintain a premium feel against the vibrant backgrounds.
- **Step Tracking**: A simple `step` state handles navigation, with a progress bar at the top to give the user visual feedback on their progress.
- **Legal Compliance**: The final slide integrates a custom checkbox for Terms and Privacy Policy. The "Finish" button remains disabled until the user agrees, ensuring zero-bypass of legal requirements.

## 💻 Implementation Details
- **File**: `user-app/screens/AuthScreens.tsx`
- **Component**: `OnboardingScreen`
- **Animation**: `animate-fade-in` for text transitions and `animate-bounce` for the floating cards to create depth.

### Slide Architecture
- **Slide 1**: Welcome & Voice/RLHF Intro (Blue/Emerald gradient)
- **Slide 2**: Payment & Task Variety (Indigo/Purple/Violet gradient)
- **Slide 3**: Data Training Impact (Teal/Blue gradient)
- **Slide 4**: Financial Control & Security (Blue/Indigo gradient)

## 🧪 Verification
- [x] "Skip" button bypasses the flow directly to Auth.
- [x] Progress bar updates correctly on step change.
- [x] Terms checkbox blocks the final "Finish" action.
