# Feature: Task Service (Backend Handshake)

## 📝 The Journey
The `TaskService` is the invisible bridge between the frontend and our Supabase/PostgreSQL backend. I engineered it to be resilient against network failures and to handle complex data payloads securely.

### Engineering Decisions
- **Active Pool Fetching**: Built a query that only pulls tasks with an "active" status and remaining capacity.
- **Payload Sanitization**: The `submitPayload` function wraps user data in a JSONB object, allowing us to store everything from simple text to S3 media URLs.
- **Transactional Integrity**: Rewards and XP are handled server-side. The service merely sends the request; the database handles the arithmetic to prevent client-side "reward injection" hacks.
- **Error Handshaking**: Implemented custom error messages (e.g., "Handshake rejected") to maintain the app's tech-noir aesthetic even during failures.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Logic**: `TaskService` object.

### Key Methods
- `fetchActivePool()`: Returns `Promise<Task[]>`.
- `submitPayload(taskId, payload, reward, xp)`: Returns status result.

## 🧪 Verification
- [x] Failed submissions log correctly to the console for debugging.
- [x] RPC calls correctly map to Supabase Edge Functions.
- [x] Environment variables (`SUPABASE_URL`, `ANON_KEY`) correctly loaded.
