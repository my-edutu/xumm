# Feature: Hybrid Capture & Language Runner

## 📝 The Journey
Sometimes one media type isn't enough. I built the `HybridCaptureScreen` and `LanguageTaskRunner` for complex dataset generation, like translating a spoken audio clip into multiple text versions.

### Engineering Decisions
- **Multi-Step Pipelines**: The Hybrid screen uses a "Current Phase" state. It might start with a photo capture and then move to a voice description phase.
- **Instructional Context**: In the `LanguageTaskRunner`, I added a persistent "Context" area so users can always see the original source text they are trying to fix or translate.
- **Dynamic Input**: Supports both voice recording and text input within the same screen, allowing for RLHF (Reinforcement Learning from Human Feedback) loops.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Components**: `HybridCaptureScreen`, `LanguageTaskRunnerScreen`.

### Data Structure
- `LinguasenseTask` interface: Contains `prompt`, `context`, and `targetLanguage`.

## 🧪 Verification
- [x] Step navigation (Next/Back) works across multi-phase tasks.
- [x] Text and Audio data combined correctly in the final submission payload.
- [x] Context panel toggle for smaller screens.
