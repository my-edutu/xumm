# Feature: Task Governance & Quality Core

## 📝 The Journey
Task Governance is where the "Rules of the Game" are set. I built this module to ensure and maintain the integrity of the data being sold to companies.

### Engineering Decisions
- **Rule Injection**: Admins can define global "Safety Thresholds" that catch low-quality data before it ever reaches a company dashboard.
- **Linguasense Sync**: A specialized sub-module for the `Linguasense` project, allowing admins to generate new AI prompts and sync them across the network with one click.
- **Dispute Resolution**: A "Judge the Judges" interface where admins review cases where the "XUM Judge" nodes provided conflicting or low-confidence results.
- **Metric Grids**: Uses `IndicatorBar` components to show the health of different data "Flows" (e.g., Audio Flow vs. Text Flow).

## 💻 Implementation Details
- **File**: `admin-panel/src/App.tsx`
- **Components**: `TaskGovernance()`, `GovernanceCore()`, `Linguasense()`.

### Technical Operations
- `handleGenerate()`: Triggers AI prompt generation for new datasets.
- `handleSync()`: Pushes the "Gold Standard" rules to all active contributor nodes.

## 🧪 Verification
- [x] Sync progress bar animates during data distribution.
- [x] Conflicting judgments are highlighted in Red in the moderation queue.
- [x] Governance toggles (ON/OFF) reflect real-time system state.
