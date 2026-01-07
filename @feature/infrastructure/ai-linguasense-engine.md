# Feature: Linguasense & AI Logic Engine

## 📝 The Journey
The final piece of the puzzle is the engine that drives our specialized linguistic data collection. This module translates corporate AI needs into human-centric tasks.

### Engineering Decisions
- **Prompt Engineering as Code**: Built the `12_linguasence_engine.sql` to manage the lifecycle of prompts used in RLHF (Reinforcement Learning from Human Feedback).
- **Consensus Scoring**: Implemented a logic where 3 separate workers review the same high-tier task. The "Ground Truth" is only established if 2 out of 3 workers agree (majority voting).
- **Cultural Bias Filtering**: specialized SQL triggers that flag submissions containing "restricted" or culturally insensitive patterns before they are added to a dataset.
- **Recursive Task Generation**: The system can automatically generate "Validation Tasks" from previous "Input Tasks" to double-check data quality autonomously.

## 💻 Implementation Details
- **Files**: `supabase/09_intelligence_logic.sql`, `supabase/12_linguasence_engine.sql`.

### Engine Capabilities
- **Prompt Synchronization**: pushing new training data to all active Linguasense nodes.
- **Consensus Engine**: Atomic resolution of multi-worker judgments.
- **Quality Gating**: Automatic rejection of low-entropy (repetitive) text submissions.

## 🧪 Verification
- [x] Majority-vote logic correctly resolves conflicting worker inputs.
- [x] Cultural filters trigger alerts on forbidden patterns.
- [x] Recursive validation tasks are correctly linked to their source submissions.
