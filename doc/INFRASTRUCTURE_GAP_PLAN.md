# XUM AI - PRD Implementation Roadmap & Gap Analysis
**Target**: Aligning current technical status with the Product Requirements Document (PRD).

---

## 🏗️ Missing Infrastructure Modules

### 1. Gamification & Retention (PRD #227, #229, #230)
*   **Streaks**: Tracking daily activity to boost user retention.
*   **Challenges**: Weekly missions (e.g., "Complete 5 Voice Tasks") for bonus rewards.
*   **Referrals**: Viral growth engine linking referrers to new contributors.

### 2. Specialized AI Data Services (PRD #102, #272, #296)
*   **XUM Linguasense (Lexicon Management)**: Structured grounding for local languages.
*   **XUM Judge (RLHF)**: High-precision human feedback loops for model calibration.
*   **Dataset Packaging**: Logic to build and version datasets (JSONL/CSV) for client export.

### 3. Advanced Operations & Safety (PRD #269, #273, #277)
*   **Validator Pool**: A specialized tier of users who review contributor work.
*   **Risk Scoring**: Probabilistic fraud detection based on behavior patterns.
*   **Policy Engine**: Geo-targeting and skill-gating for projects.

---

## 🛠️ Implementation Plan

### Phase 1: Skills, Languages & Gating (Operations foundational)
- [ ] Implement `user_skills` and `user_languages` tracking.
- [ ] Update `tasks` table with `required_skills`, `required_level`, and `target_regions`.
- [ ] Build the **Validator Pool** role-based filtering.

### Phase 2: Engagement & Social (Retention)
- [ ] Implement `user_streaks` table and daily update trigger.
- [ ] Implement `referrals` system with bounty logic.
- [ ] Implement `challenges` and `user_challenges` (Weekly goals).

### Phase 3: Dataset Commerce & Governance (Enterprise)
- [ ] Implement `lexicons` for XUM Linguasense data management.
- [ ] Implement `dataset_exports` and `export_versions`.
- [ ] Implement `risk_profiles` for users based on quality logs.

---

## 📅 Roadmap Execution
1.  **SQL Migrations**: Update Supabase schema to support the above.
2.  **Edge Functions**: Logic for streak calculations and dataset generation.
3.  **Admin UI**: Modules for Lexicon management and Revenue/Budget monitoring.
4.  **User App**: Referral and Skill Selection screens integration.
