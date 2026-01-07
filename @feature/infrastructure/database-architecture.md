# Feature: Core Database & Relational Architecture

## 📝 The Journey
The foundation of XUM AI is its highly normalized PostgreSQL schema. I designed it to handle massive volumes of task metadata while maintaining referential integrity across users, companies, and projects.

### Engineering Decisions
- **Unified Identity Model**: Built a `users` table that handles both Workers and Company Managers via a `role` field, enabling cross-platform session management.
- **Relational Integrity**: 
    - **Projects <-> Tasks**: A one-to-many relationship that allows companies to scale their data requirements horizontally.
    - **Tasks <-> Submissions**: Captures the "Proof of Work" from users, linked by foreign keys to ensure no orphaned data points.
- **Optimized Indexing**: Applied indexes on `user_id`, `project_id`, and `status` fields to ensure that dashboard queries return in under 100ms even with 1M+ rows.
- **Type-Safety with Enums**: Used Postgres Enums for statuses (e.g., `task_status`, `payment_status`) to prevent dirty data at the protocol level.

## 💻 Implementation Details
- **File**: `supabase/00_schema.sql`
- **Database**: PostgreSQL (via Supabase).

### Core Entities
- `users`: Profile data, balance, and reputation.
- `projects`: Managed by companies, contains budgeting rules.
- `tasks`: Individual units of work with type-specific parameters.
- `submissions`: User-generated data and audit trails.

## 🧪 Verification
- [x] Cascading deletes prevent orphaned data points.
- [x] UUID generation ensures unique identifiers across distributed clusters.
- [x] Table constraints prevent negative balances or logically impossible states.
