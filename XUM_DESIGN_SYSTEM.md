# 🌌 XUM AI: Cinematic Intelligence Design System
**Version 2.0 | Institutional Grade UI/UX Framework**

Welcome to the official design system for XUM AI. This document serves as the "single source of truth" for designers and engineers, ensuring that every pixel aligns with our **"Cinematic Intelligence"** aesthetic: a fusion of high-performance tech sophistication and gamified engagement.

---

## 🎭 1. Design Philosophy
XUM AI is not just a platform; it's a high-trust, agentic environment. Our UI must reflect three core values:
1.  **Immersive Depth**: Use of glassmorphism and multi-layered surfaces to create a sense of space.
2.  **Intentional Precision**: Every detail—from micro-animations to corner radii—must feel purposeful and engineered.
3.  **Human-Centric AI**: Warm accents (Solar Orange) and friendly typography (Inter/Outfit) to make advanced AI feel accessible.

---

## 🎨 2. Visual Foundation (Design Tokens)

### 2.1 Color Palette
We utilize a **Midnight First** strategy. Colors are defined via HSL for programmatic manipulation (opacity, lightness shifts).

| Role | Color Name | Hex | HSL | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Solar Orange | `#F97316` | `24 95% 53%` | CTAs, Branding, Focus |
| **Secondary** | Neural Blue | `#3B82F6` | `217 91% 60%` | Info, Data Viz, High-Tech |
| **Background** | Deep Space | `#020617` | `222 47% 5%` | Main Page Background |
| **Surface** | Elevated Panel | `#0F172A` | `222 47% 11%` | Cards, Sidebar, Modals |
| **Border** | Glass Border | `rgba(255,255,255,0.08)` | N/A | Subtile component edges |
| **Success** | Emerald | `#10B981` | `161 68% 40%` | Rewards, Verification |
| **Error** | Crimson | `#EF4444` | `0 84% 60%` | Alerts, Failures |

### 2.2 Typography
We use a dual-font strategy to balance character and readability.

*   **Headings**: `Outfit` (Google Fonts) – Geometric, premium, and professional.
*   **Body & UI**: `Inter` (Variable) – Maximum legibility and crispness.

#### Typographic Scale
| Level | Font | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Outfit | 40px | 800 | 1.1 | Hero / Landing |
| **H1** | Outfit | 32px | 700 | 1.2 | Page Titles |
| **H2** | Outfit | 24px | 600 | 1.3 | Section Headers |
| **H3** | Outfit | 20px | 600 | 1.4 | Module Headers |
| **Body (L)** | Inter | 18px | 400 | 1.6 | AI Responses |
| **Body (M)** | Inter | 16px | 400 | 1.5 | Default UI |
| **Body (S)** | Inter | 14px | 500 | 1.4 | Helper / Forms |
| **Caption** | Inter | 12px | 600 | 1.2 | Metadata (Caps) |

---

## 📐 3. Grid & Layout Strategy

### 3.1 Responsive Breakpoints
Our system adapts dynamically across three main viewports.

| Device | Breakpoint | Grid Columns | Margin | Target |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `< 768px` | 4 Col | 16px | Native App Feel |
| **Tablet** | `768px - 1024px`| 8 Col | 32px | Portable Productivity |
| **Desktop** | `> 1024px` | 12 Col | 40px+ | Institutional Control |

### 3.2 Component Adaptation Rules
*   **Mobile**: Bottom Tab Navigation (64px height). Modals are "Bottom Sheets". 100% width buttons.
*   **Tablet**: Side Sidebar (Compact/Icon only). Content centered in a 720px container for readability.
*   **Desktop**: Full Side Sidebar (280px). Multi-column dashboard layouts. Hover states active.

---

## 🧱 4. Component Patterns

### 4.1 The "XUM Card" (Glassmorphism)
All primary surfaces follow the **Glass Architecture**.
*   **Background**: `rgba(15, 23, 42, 0.6)`
*   **Backdrop Blur**: `12px`
*   **Border**: `1px solid rgba(255, 255, 255, 0.08)`
*   **Shadow**: `0 10px 30px -10px rgba(0,0,0,0.5)`
*   **Corner Radius**: `24px` (Large) or `16px` (Standard).

### 4.2 Interactive Elements
*   **Primary Button**: Full Solar Orange gradient (`linear-gradient(135deg, #F97316 0%, #EA580C 100%)`). 
    *   *Hover*: Subtle brightness increase + 4px lift.
    *   *Active*: 0.96 scale down for tactile feedback.
*   **Input Fields**: Darker surface (`#070a13`) with active orange ring.
    *   *Expert Note*: Always use `16px` font size on mobile to prevent iOS "Auto-Zoom" on focus.

---

## 🎬 5. Motion & Interaction Principles
Movement is used to convey "AI Intelligence"—it should be fluid and non-linear.

1.  **Entrance**: `cubic-bezier(0.22, 1, 0.36, 1)` (The "Apple" Ease).
    *   Elements slide in with a 20px Y-offset + fade.
2.  **State Change**: 200ms duration for toggles/switches.
3.  **Loading**: Orchestrated skeletons (shifting gradients) instead of basic spinners.

---

## ♿ 6. Accessibility & Inclusivity
We strive for **WCAG 2.1 AA Compliance**.
*   **Contrast**: Critical text (Orange on Dark) must maintain 4.5:1 ratio.
*   **Touch Targets**: Minimum 44px x 44px for all mobile interactive zones.
*   **Screen Readers**: All icons (Lucide/Material) must have `aria-label` or be set to `aria-hidden` if decorative.

---

## 🛠 7. Implementation Cheat Sheet (CSS)

```css
/* Core Glass Utility */
.glass {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem; /* 24px */
}

/* Premium Gradient Text */
.text-gradient {
  background: linear-gradient(135deg, #F97316 0%, #FDE047 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Tactile Button Feedback */
button:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}
```

---

## 🚀 8. Visual Checkmarks
- [ ] No pure black or pure white (Use Slate-900 and Slate-300).
- [ ] Line-height is at least 1.5 for body text.
- [ ] Corner radii are consistent (24px for large containers, 8px for small buttons).
- [ ] All gradients flow from Top-Left to Bottom-Right at 135 degrees.
- [ ] Spacing follows the 4px or 8px grid (8, 16, 24, 32, 48, 64).

**End of Document**
