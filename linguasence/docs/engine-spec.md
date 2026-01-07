# XUM Linguasense Engine: Technical Specification & Implementation Roadmap

## 1. Vision
XUM Linguasense is not just a UI form; it is a **bi-directional data synthesis and labeling engine**. It bridges the gap between raw human cultural intelligence and machine-readable training data.

### Core Capabilities:
*   **Human-to-Dataset (H2D)**: Converting raw human input (voice, slang, cultural context) into structured, high-fidelity JSON/Parquet datasets for LLM fine-tuning.
*   **Dataset-to-Human (D2H)**: Using LLMs to generate complex prompts that require human "grounding" or validation to resolve ambiguity.
*   **Prompt Engineering Framework**: A dynamic system that adjusts prompting strategies based on the target language's complexity and data density.

---

## 2. Theoretical Framework (The "Deep Framework")
The engine operates on a **Tri-Layer Consensus Model**:
1.  **AI Layer (LLM)**: Generates initial prompts, detects anomalies, and performs preliminary categorization.
2.  **Human Layer (Contributors)**: Provides the "Ground Truth" (Local dialect, sentiment, cultural relevance).
3.  **Validation Layer (Expert/Consensus)**: Cross-references human inputs against AI benchmarks and peer review to ensure 99.9% accuracy.

---

## 3. Implementation Roadmap (Start to Finish)

### Phase 1: Infrastructure & Schema (Week 1)
*   **Task 1.1**: Define the `lexicon_metadata` and `grounding_tasks` tables in Supabase.
*   **Task 1.2**: Implement RLHF (Reinforcement Learning from Human Feedback) storage optimized for audio-text pairs.
*   **Task 1.3**: Set up S3-compatible storage (Hetzner) for high-volume media assets.

### Phase 2: LLM & Prompt Pipeline (Week 2)
*   **Task 2.1**: Develop a "Prompt Factory" service to generate language-specific grounding tasks.
*   **Task 2.2**: Integrate Gemini/GPT-4 for automated quality scoring of human inputs.
*   **Task 2.3**: Build the "Ambiguity Detector" – an LLM-driven tool that identifies which data points need human intervention.

### Phase 3: The Linguasense Flow (Week 3)
*   **Task 3.1**: Implement the `LinguasenseScreen` in the mobile app with multi-modal support.
*   **Task 3.2**: Develop the "Consensus Engine" – a backend service that calculates voter agreement scores.
*   **Task 3.3**: Create the "Dataset Export Pipeline" – converting validated entries into fine-tuning formats (JSONL).

### Phase 4: API & Enterprise Layer (Week 4)
*   **Task 4.1**: Build the API Gateway for external data consumption.
*   **Task 4.2**: Implement "Project Sandboxes" for companies to upload their own raw data for Linguasense processing.
*   **Task 4.3**: Integrate usage-based billing (Paystack/Stripe).

---

## 4. Task List for Execution

| ID | Task Name | Status | Priority |
|:---|:---|:---|:---|
| T1 | Create `linguasence_tasks` and `linguasence_responses` tables | ⏳ Pending | High |
| T2 | Develop LLM-based Prompt Generation Service | ⏳ Pending | High |
| T3 | Implement Mobile UI for Multi-modal Linguasense | ⏳ Pending | Medium |
| T4 | Create Consensus Scoring Algorithm (Edge Function) | ⏳ Pending | High |
| T5 | Build JSONL Export Utility for fine-tuning | ⏳ Pending | Medium |
| T6 | Implement API Key Management for Companies | ⏳ Pending | High |

---

## 5. Deployment Framework
*   **Orchestration**: Node.js workers managing LLM requests and Human task assignments.
*   **Database**: Supabase for real-time state and PostgreSQL power.
*   **AI**: Gemini API for prompt synthesis and validation.
