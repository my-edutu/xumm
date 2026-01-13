# 📄 Product Requirements Document (PRD): XUM AI Landing Page
**Version 1.0 | Project: XUM Ecosystem Public Face**

---

## 1. Product Overview
The XUM AI Landing Page serves as the primary entry point for the entire ecosystem. It must effectively communicate the value of the platform to two distinct audiences: **Enterprise Partners** (seeking high-fidelity data) and **Individual Contributors** (seeking to capitalize their intelligence).

### 1.1 Objectives
*   **Establish Trust**: Position XUM AI as an institutional-grade AI data synthesizer.
*   **Lead Generation**: Capture email leads for the "Coming Soon" mobile app.
*   **User Routing**: Seamlessly direct partners to the Company Portal and admins to the Admin Panel.
*   **Brand Awareness**: Showcase the "Cinematic Intelligence" aesthetic.

---

## 2. Target Audience
1.  **AI Researchers & Enterprise Leads**: Need scalable, validated datasets for training models.
2.  **Global Contributors**: Individuals looking to earn by completing micro-tasks.
3.  **Institutional Investors**: Seeking evidence of network growth and technological superiority.

---

## 3. Functional Requirements (Features)

### F1: Hero Section (The Hook)
*   **Requirement**: Immersive high-performance visual with the primary value proposition.
*   **Features**:
    *   Dynamic Heading: "The Synthesis of Human Intelligence and AI Excellence."
    *   Dual CTA strategy: "Empower Your AI" (B2B) and "Start Earning" (B2C).
    *   Visual: Cinematic background (Glassmorphism + Mesh Gradients).

### F2: The Linguasense Engine Showcase
*   **Requirement**: Technical deep-dive into the proprietary consensus model.
*   **Features**:
    *   Interactive "Logic Map" showing how data flows through the weighted consensus engine.
    *   Benefit cards: "Bi-directional Grounding," "Multi-modal Validation," "Democratic Accuracy."

### F3: Partner / Company Entry Point (The Pipeline)
*   **Requirement**: Sell the "Company Portal" features and provide a clear login path.
*   **Features**:
    *   "Pipeline Management" visualization.
    *   Direct link to `company.xum.ai` (Company Portal).
    *   High-level feature list: Real-time Synthesis, Custom Workflows, Secure Settlement.

### F4: Mobile App "Coming Soon" Section
*   **Requirement**: Drive hype and capture leads for the Play Store launch.
*   **Features**:
    *   3D Mockup of the XUM App interface.
    *   "Play to Earn" feature highlights (XP, Levels, The Vault).
    *   **Waitlist Form**: Email collection integrated with Supabase/Brevo.
    *   Play Store Badge: "Coming Soon" status.

### F5: Dynamic Network Stats
*   **Requirement**: Real-time counter showing platform scale.
*   **Features**:
    *   Counters for: Active Creators, Points Synthesized, Consensus Accuracy (%), and Capital Distributed.
    *   Animation: Numbers count up on scroll-into-view.

---

## 4. Non-Functional Requirements

### 4.1 UI/UX (Cinematic Intelligence)
*   **Theme**: Midnight First (Background: `#020617`).
*   **Accent**: Solar Orange (`#F97316`) for primary actions.
*   **Animations**: Framer Motion / CSS Transitions for "Cubic-Bezier" smooth movement.
*   **Responsiveness**: Mobile-first architecture (100% responsive).

### 4.2 Performance & SEO
*   **Load Time**: < 1.5s (LCP).
*   **SEO**: Optimized Meta tags, OG images for social sharing, and semantic HTML (H1-H4 hierarchy).
*   **Analytics**: Integration with Google Analytics or Plausible.

---

## 5. Technical Stack & Architecture

### 5.1 Technology Stack
*   **Framework**: Vite + React 19 + TypeScript (Consistency with existing ecosystem).
*   **Styling**: Vanilla CSS with Design System Tokens (Defined in `XUM_DESIGN_SYSTEM.md`).
*   **Animations**: Framer Motion for entrance/exit transitions and parallax effects.
*   **Lead Capture**: Supabase Client (Directly communicating with a `waitlist` table).
*   **Routing**: React Router (Simple single-page navigation with hash-scrolling).

### 5.2 Component Breakdown
1.  **`Hero.tsx`**: High-impact entrance with multi-layered SVG mesh background.
2.  **`LinguasenseFlow.tsx`**: An SVG-based interactive diagram showing data validation steps.
3.  **`WaitlistForm.tsx`**: A glassmorphism-styled input with real-time feedback and Supabase integration.
4.  **`StatGrid.tsx`**: A dynamic grid that fetches current network stats (simulated or real).
5.  **`Navbar.tsx`**: Sticky glass navigation with logic to hide/show on scroll.

### 5.3 Implementation Milestones

#### Phase 1: The Core Scaffolding
*   Bootstrap Vite project in `landing-page/`.
*   Establish `index.css` with HSL variables from the design system.
*   Implement `Layout.tsx` with cinematic background effects.

#### Phase 2: Content & UX Integration
*   Implement `Hero` section with the "Synthesis" hook.
*   Build the `PartnerEntry` (B2B) and `AppTeaser` (B2C) sections.
*   Develop the `Linguasense` technical storytelling section.

#### Phase 3: Connectivity & Lead Capture
*   Configure Supabase client for analytics and lead capturing.
*   Implement `waitlist_submissions` table logic in Supabase.
*   Add Brevo API edge function for "Success" email notifications.

#### Phase 4: Cinematic Polish
*   Add "Cubic-Bezier" scroll-reveal animations.
*   Optimize LCP by Lazy-loading 3D/high-res assets.
*   Final SEO audit (Meta tags, Sitemap, Robot.txt).

---

## 6. Data Schema (Supabase)
### Table: `marketing_waitlist`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `email` | text | Unique user email |
| `role` | text | 'creator' or 'partner' |
| `metadata` | jsonb | IP, User Agent, Signup Source |
| `created_at`| timestamp | - |

---

## 7. Success Metrics
*   **Primary**: 5%+ conversion rate on "Join Waitlist" CTAs.
*   **Secondary**: 30% click-through rate to the Company Portal login.
*   **Technical**: < 1s Time to Interactive (TTI).

---
**End of PRD**
