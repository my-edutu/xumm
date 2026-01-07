# XUM Linguasense 🧠

## Overview
XUM Linguasense is a core feature of the XUM AI platform focused on **local language grounding**. It empowers users to contribute high-quality data in their native languages, including dialects and cultural nuances that are often missing from global AI models.

As a **Product Differentiator**, Linguasense ensures that XUM AI produces datasets that are not just translated, but culturally and contextually accurate.

## 🔄 User Workflow
The Linguasense flow is designed to capture multiple facets of language:

1.  **Data Type Selection**: Contributors choose whether to provide **Text**, **Voice**, or **Both**.
2.  **Structured Prompting**: The system provides a prompt or a specific word/concept that needs local grounding.
3.  **Data Entry**:
    *   **Word/Phrase**: The exact local term.
    *   **Explanation**: Contextual meaning, usage notes, or cultural significance.
    *   **Pronunciation**: Audio recording for voice-enabled tasks.
4.  **Community Validation**: Submissions are cross-checked by other fluent speakers to reach a **Consensus**.

## 🛠 Features (MVP & Beyond)
*   **Prompt-based language collection**: Dynamically generate tasks based on company needs.
*   **Multi-modal submissions**: Support for audio recordings and text explanations.
*   **Consensus Engine**: Built-in validation flow where multiple users verify the same entry (Linguasense Validation).
*   **Expert Review**: Qualified users (Validators) perform final checks on quality.

## 📂 Project Structure
This directory serves as the dedicated module for Linguasense within the main XUM AI User App.

*   `docs/`: Detailed technical specifications and business logic.
*   `supabase/`: Database schemas, edge functions, and RLS policies specific to language grounding.
*   `ui/` (Planned): Dedicated components for language capture and validation.

---
*Part of the XUM AI Ecosystem*
