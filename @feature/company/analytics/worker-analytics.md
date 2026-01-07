# Feature: Worker Quality & Behavioral Analytics

## 📝 The Journey
Building trust in a decentralized network requires deep behavioral analysis. The `WorkerAnalytics` view allows companies to vet the people training their AI models.

### Engineering Decisions
- **Quality Scoring (Precision vs. Recall)**: Tracks how often a worker's submission matches the consensus of the "XUM Judge" nodes.
- **Efficiency Benchmarking**: Compares a worker's speed against the network average for that specific task type.
- **Fraud/Anomaly Detection**: Integrated alerts for "Extreme Speed" or "Repetitive Patterning" which might indicate automated bot behavior.
- **Engagement Funnels**: Shows the lifecycle of a worker from "Task Claimed" to "Handshake Completion."

## 💻 Implementation Details
- **File**: `company/src/pages/WorkerAnalytics.tsx`
- **Component**: `WorkerAnalytics()`.

### Analytics Dimensions
- **Task Diversity**: Does the worker specialize or do everything?
- **Retention**: How often does this worker return to this company's specific projects?
- **Vetting Tier**: Workers are bucketed into Standard, Verified, and Elite based on their historical metadata.

## 🧪 Verification
- [x] Worker ranking table sorts correctly by any column (XP, Accuracy, etc.).
- [x] Filter for "Elite Only" narrows the view to high-trust nodes.
- [x] Visual graphs show the correlation between worker speed and accuracy.
