# Feature: Advanced Task Builder (Architecture)

## 📝 The Journey
The Task Builder is the "factory floor" tool where companies define the data they need. I designed it as a multi-step wizard to prevent user overwhelm and ensure all metadata is captured correctly.

### Engineering Decisions
- **Step-Based Progress**: Used a `StepIndicator` to guide the user through "Task Type", "Parameters", and "Budgeting."
- **Visual Type Selection**: instead of a dropdown, I created `TypeCard` components with large icons (Mic, Type, Image) to make the primary decision intuitive.
- **Instructional Context**: Built an editor area where companies can upload "Gold Standard" examples that the AI and human workers use as a reference.
- **Cost Scaling Logic**: Integrated a dynamic budget calculator that estimates total project cost based on unit price and desired sample count.

## 💻 Implementation Details
- **File**: `company/src/pages/TaskBuilder.tsx`
- **Component**: `TaskBuilder()`.
- **Logic**: `currentStep` state handles the UI transition between wizard phases.

### Configurable Parameters
- **Data Type**: Audio, Image, Text, or RLHF.
- **Targeting**: Specific languages or regions.
- **Reward per Unit**: What the user app contributors will receive.

## 🧪 Verification
- [x] Step validation prevents moving forward without selecting a task type.
- [x] TypeCards highlight correctly when selected.
- [x] Budget summary updates in real-time as units/price change.
