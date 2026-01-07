# Feature: XUM Judge & RLHF Correction

## 📝 The Journey
This is the "elite" layer of XUM AI. I designed these screens to feel like a high-level auditing station. Users aren't just tagging images here; they are correcting the "thought process" of an AI.

### Engineering Decisions
- **Split-Screen Analysis**: The UI is designed to show the "AI Proposal" and the "Human Correction" side-by-side or in a vertical hierarchy.
- **Decision Logic**: Users provide a binary "Correct/Incorrect" or a multi-level rating for accuracy, safety, and cultural relevance.
- **Complexity Handlers**: 
    - **Cultural Correction**: Specifically designed to catch nuances that models often miss in local dialects or social norms.
    - **General Knowledge RLHF**: Focuses on factual accuracy and grounding.
- **Elite Status Badge**: These tasks are visually marked with a "PURPLE" theme and a "Gavel" icon to denote their high importance and higher rewards.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Components**: `XUMJudgeTaskScreen`, `RLHFCorrectionTaskScreen`.

### Data Flow
1. Fetch prompt and AI response.
2. Capture Human preference/correction.
3. Submit as `rlhf_node` type.

## 🧪 Verification
- [x] High-tier reward (e.g., $2.50) correctly displayed in cards.
- [x] Specific elite icons (`gavel`, `auto_fix_high`) used for these modules.
- [x] Context data preserved during the submission handshake.
