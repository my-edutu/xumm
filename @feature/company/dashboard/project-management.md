# Feature: Project Management & Deep Dive

## 📝 The Journey
Once a manager selects a project, they need deep operational visibility. The `ProjectDetail` view provides a breakdown of task distribution and worker performance specific to that project.

### Engineering Decisions
- **Contextual Management**: The screen adapts based on the `projectId`, pulling specific metadata about the task set.
- **Resource Allocation View**: Displays how many units of work (audio, text, image) are currently being processed versus completed.
- **Worker Leaderboard (Project-Specific)**: A dedicated section to see which contributors are providing the highest precision for this specific project.
- **Actionable Controls**: integrated "Pause", "Scale", and "Export" buttons to give managers real-time control over their budget and output quality.

## 💻 Implementation Details
- **File**: `company/src/pages/ProjectDetail.tsx`
- **Component**: `ProjectDetail()`.

### Visual Hierarchy
- **Header**: Project name, status badge, and global actions.
- **Stats Row**: Units completed, cost per unit, and average accuracy.
- **Task Breakdown**: List of task types within the project and their individual completion rates.

## 🧪 Verification
- [x] "Back to Dashboard" button clears the selected project state.
- [x] Accuracy percentages are color-graded (Green > 90%, Yellow > 70%).
- [x] Export button triggers a data dump protocol (Mocked).
