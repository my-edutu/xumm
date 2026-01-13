# Admin Panel Implementation Task
**Goal**: Build a functional React-based Admin Panel to manage XUM AI operations.

---

## 📋 Task Specification

### 1. Project Initialization
- [x] Create `admin-panel/` directory.
- [x] Initialize React + Vite project inside.
- [x] Set up directory structure: `src/`, `doc/`, `supabase/`.
- [x] Share Supabase configuration from the main project.

### 2. Core Modules (Phase 1)
- [x] **Auth**: Admin-specific login flow with role check.
- [x] **Dashboard Overview**: Cards showing total users, active tasks, pending reviews, and payout volume.
- [x] **User Management**: View user list, trust scores, and ban functionality.
- [x] **Task Management**: Create, edit, and pause tasks. (Structure in place)
- [x] **Submission Review**: Queue for approving/rejecting user submissions. (Structure in place)
- [x] **Payout Queue**: Process withdrawal requests. (Structure in place)

### 3. Synchronization
- [x] Use the same Supabase database as the primary app.
- [x] Ensure admin role check via RLS or logic.

---

## 🛠️ Implementation Plan

### Step 1: Subfolder Setup
- Create `admin-panel`.
- Initialize `vite` project.
- Remove default boilerplate.

### Step 2: Documentation
- Create `admin-panel/doc/README.md`.
- Document common API endpoints shared with the main app.

### Step 3: Global State & Context
- Implementation of `AdminContext` for handling session and global stats.

### Step 4: UI/UX
- Use a clean, professional dashboard aesthetic (Premium Dark or Clean Professional).
- Implement sidebar navigation.

---

## ✅ Success Criteria
- Admin can login securely.
- Dashboard displays real data from Supabase.
- Admin can approve a submission, which updates the user's balance in the main app.
- Admin can process a withdrawal request.
