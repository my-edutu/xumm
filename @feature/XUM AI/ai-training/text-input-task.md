# Feature: Text Input & Semantic Validation

## 📝 The Journey
Simple tasks like sentiment check or street sign labeling require a keyboard-first interface. I focused on making the text entry area feel spacious and professional.

### Engineering Decisions
- **Intelligent Textarea**: Auto-expanding input area that prevents the keyboard from obscuring the "Submit" button on mobile devices.
- **Character/Word Counting**: (Placeholder for future iteration) Designed to ensure contributors meet the minimum semantic length for the dataset.
- **Validation Gates**: Instead of just typing, the `ValidationTaskScreen` presents the user with a "Source" and asks them to verify its accuracy against a "Ground Truth."
- **Minimalist UI**: Removed all distractions to allow the user to focus 100% on the semantic content of the task.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Components**: `TextInputTaskScreen`, `ValidationTaskScreen`.

### Form States
- `input`: Captures the raw string from the user.
- `isValid`: A boolean check if the input meets the task requirements before allowing submission.

## 🧪 Verification
- [x] Soft keyboard does not break the layout on small screens.
- [x] Empty submissions are blocked by the UI.
- [x] Success screen triggers with correct reward data post-submission.
