# Linguasense Prompt Engineering Templates

## 1. Grounding Prompt (H2D)
**Goal**: Get fresh human data for a specific concept.
**Template**:
```markdown
Context: [Subject, e.g., Financial Transactions]
Target Language/Dialect: [Language, e.g., West African Pidgin]
Task: Provide the most natural way a person in [Region] would say "[Target Phrase]".
Additional: Please explain any cultural subtext or specific emotional weight this phrase carries compared to standard English.
```

## 2. Validation Prompt (The Judge)
**Goal**: Have an LLM or human verify correctness.
**Template**:
```markdown
Input Term: [User Submission]
Provided Explanation: [User Explanation]
Language: [Target Language]
Question: Is this term used naturally in everyday conversation? 
Rating (1-5): 
Reasoning: [Why it is or isn't accurate]
```

## 3. Dataset Synthesis (D2H)
**Goal**: Generate a task for a human based on a gap in an existing dataset.
**Template**:
```markdown
Analysis: The current dataset for [Language] is missing high-intensity emotional expressions related to [Scenario, e.g., Joy/Celebration].
Instruction: Generate a prompt to ask users for their local "cheers" or "exclamations of success" during a wedding or sporting event.
```

## 4. Ambiguity Resolution
**Goal**: Ask a human to clarify a conflict in consensus.
**Template**:
```markdown
Conflict: Two users have provided different meanings for the word "[Word]".
User A says: [Definition A]
User B says: [Definition B]
Task: As a native speaker, can both be correct? Or is one more common in a specific region? Please provide a definitive example sentence for the most common usage.
```
