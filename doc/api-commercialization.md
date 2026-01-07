# XUM AI: API Commercialization & Data-as-a-Service Strategy

## 1. Executive Summary
XUM AI provides high-fidelity, culturally grounded datasets through the **Linguasense Engine**. We will offer these datasets and the underlying labeling infrastructure to AI startups, research labs, and global enterprises via a tiered API model.

---

## 2. Product Offerings

### A. Raw Dataset Access (The Data Store)
*   **What**: Access to pre-validated, high-quality datasets in local languages (Niche/Emerging markets).
*   **Format**: API endpoints returning JSONL, Parquet, or CSV.
*   **Pricing**: Per-record download or bulk subscription.

### B. Linguasense-as-a-Service (Custom Labeling)
*   **What**: Companies upload their own raw, unlabelled data (Voice/Text) and use our global contributor network + Linguasense Engine to label it.
*   **Pricing**: Cost-per-label + Platform fee.

### C. Real-time Grounding API
*   **What**: A live API where an external LLM can send a phrase/word to XUM in real-time to get a "Cultural Context Score" or "Slang Translation".
*   **Pricing**: Per-call (Latency-optimized).

---

## 3. Tiered Subscription Model

| Tier | Target | Key Features | Pricing (Est.) |
|:---|:---|:---|:---|
| **Free / Dev** | Individual Researchers | 100 calls/month, Rate-limited | $0 |
| **Startup** | AI Research Startups | 10,000 calls/month, Batch exports | $299/mo |
| **Pro** | Mid-size Enterprises | 100k calls/month, Custom RLHF tasks | $999/mo |
| **Enterprise** | Large Tech Corps | Unlimited, SLA, Dedicated Validators | Custom |

---

## 4. Go-to-Market (GTM) Plan

### Phase 1: The "Hugging Face" Approach
*   Release "Gold Standard" sample datasets (e.g., Nigerian Pidgin, Swahili Dialects) for free on platforms like Hugging Face to showcase the Linguasense Engine's quality.
*   Drive developers to the XUM Developer Portal for more data.

### Phase 2: Direct Enterprise Outreach
*   Target LLM developers (OpenAI, Google, Meta) who lack regional language data.
*   Offer "Culture Patch" datasets to help them fix bias in their global models.

### Phase 3: Developer Ecosystem
*   Provide robust SDKs (Python, Node.js).
*   Interactive API documentation (Swagger/Redoc).
*   Developer Sandboxes with $50 credit.

---

## 5. Technical Sales Infrastructure
*   **Auth**: API Key-based authentication with rotation capability.
*   **Metering**: Real-time usage tracking integrated with the Company Portal.
*   **Compliance**: Ensure GDPR/NDPR compliance for all exported datasets.
*   **Documentation**: Maintain a `docs.xum.ai` subdomain (or `/docs/api` route).

---

## 6. Next Steps for Implementation
1.  Finalize the `company_api_keys` table in Supabase.
2.  Develop the `GET /api/v1/datasets` endpoint.
3.  Set up the billing webhook integration with Paystack/Stripe.
