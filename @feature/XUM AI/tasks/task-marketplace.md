# Feature: Task Marketplace (The Exchange)

## 📝 The Journey
The Marketplace is where the "mining" happens. I wanted it to feel like a high-velocity exchange. The primary challenge was handling various task types (Audio, Text, Image, RLHF) in a single, unified view while maintaining performance.

### Engineering Decisions
- **Real-time Synchronization**: The marketplace isn't static. I built a `handleRefresh` trigger that pulls the latest "Active Pool" from the database.
- **Categorization Logic**: Integrated a filter bar that allows users to toggle between "All", "Voice", and "Elite" (RLHF) tasks.
- **Dynamic Skill Tags**: Each task card displays its reward, XP, time estimate, and difficulty level using color-coded badges (e.g., Emerald for XP, Primary for Pay).
- **Infinite Loading Support**: Built with a clean vertical layout that scales gracefully as the task pool grows.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Component**: `TaskMarketplaceScreen`
- **API**: Uses `TaskService.fetchActivePool()` to sync with the backend.

### Task Card Components
- **Identity**: Icon representing the task type (mic, edit, gavel).
- **Metadata**: Time required + Difficulty level.
- **Reward**: High-contrast price tag (e.g., "$2.50").

## 🧪 Verification
- [x] "Refresh" button successfully re-fetches pool.
- [x] Filtering by type correctly toggles visible cards.
- [x] Navigation to `TASK_DETAILS` passes the correct context.
