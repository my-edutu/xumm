# Linguasense Technical Architecture

## Integration with Main App
XUM Linguasense is integrated into the User Platform as a specific task category. It utilizes the global task system but introduces specialized data models for "lexicons" and "language grounding".

## 📊 Data Models

### Lexicon Entry
This table (planned) stores the grounded language data.
```sql
CREATE TABLE linguasence_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id),
    contributor_id UUID REFERENCES auth.users(id),
    language_code TEXT NOT NULL,
    word TEXT NOT NULL,
    explanation TEXT,
    pronunciation_url TEXT, -- Link to storage (S3/Supabase)
    status TEXT DEFAULT 'pending', -- pending, validated, rejected
    consensus_score FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Consensus Table
Stores peer-reviews of Linguasense entries.
```sql
CREATE TABLE linguasence_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES linguasence_entries(id),
    validator_id UUID REFERENCES auth.users(id),
    is_correct BOOLEAN,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔌 API & Services
*   **Prompt Generator**: Fetches structured requirements from the database based on the active language project.
*   **Validation Service**: An edge function that calculates consensus scores and updates entry status.
*   **Media Handler**: Manages uploading audio recordings to Supabase Storage with appropriate metadata.

## 📱 Navigation Path
*   **Entry Point**: Navigation Tab `Create (+)` -> Section `🧠 XUM Linguasense`.
*   **Screen**: `LinguasenseScreen` (implemented in `TaskScreens.tsx`).
*   **Runner**: `LanguageTaskRunnerScreen`.

## 🛡 Security & RLS
*   Only users with verified language skills can access specific Linguasense tasks.
*   Contributors cannot validate their own submissions.
*   Regional targeting ensures only native speakers from specific areas can provide cultural context.
