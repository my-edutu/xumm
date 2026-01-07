Great focus 👍
A **text-only design system** is exactly where readability, fun, and UX are won or lost.

Below is a **complete mobile typography system** you can use for **Xum AI**, designed to feel **friendly, intelligent, and modern**, without being noisy.

---

# 📱 Xum AI — Mobile Typography Design System

### Design Goals

* **Fun but not childish**
* **Highly readable on small screens**
* **Calm AI-assistant feel**
* **Scales well across Android & iOS**
* **Works for long reading + quick scanning**

---

## 1️⃣ Font Stack (Primary Decision)

### Primary Font (Recommended)

**Inter**

* Extremely readable on mobile
* Neutral + modern
* Excellent line-height behavior
* Widely used in top AI & SaaS apps

**Fallbacks**

```
Inter → SF Pro (iOS) → Roboto (Android) → System Default
```

> If you want *slightly more playful*, I can swap Inter for **Manrope** or **DM Sans**.

---

## 2️⃣ Typography Scale (Mobile-First)

**Base unit:** `4px system`
**Base body size:** `16px`

| Style      | Font Size | Line Height | Weight | Usage                    |
| ---------- | --------- | ----------- | ------ | ------------------------ |
| Display    | 32px      | 40px        | 700    | Hero headlines           |
| H1         | 28px      | 36px        | 700    | Page titles              |
| H2         | 24px      | 32px        | 600    | Section headers          |
| H3         | 20px      | 28px        | 600    | Card titles              |
| Body Large | 18px      | 28px        | 400    | AI responses, long reads |
| Body       | 16px      | 24px        | 400    | Default text             |
| Body Small | 14px      | 20px        | 400    | Helper text              |
| Caption    | 12px      | 16px        | 400    | Metadata                 |
| Overline   | 11px      | 16px        | 500    | Labels                   |

---

## 3️⃣ Button & Interactive Text

| Type               | Size | Line Height | Weight |
| ------------------ | ---- | ----------- | ------ |
| Primary Button     | 16px | 20px        | 600    |
| Secondary Button   | 14px | 18px        | 600    |
| Text Button / Link | 14px | 20px        | 500    |

### Button Height Rule (for UX)

* **Minimum touch height:** `48px`
* **Text vertical padding:** `14–16px`

---

## 4️⃣ AI Chat Text Rules (Very Important for Xum AI)

### AI Response Text

* Font size: **16–18px**
* Line height: **1.5–1.6**
* Paragraph spacing: **8–12px**
* Max line length: **60–70 characters**

### User Input Text

* Font size: **16px**
* Line height: **24px**
* Weight: **400**
* Placeholder weight: **400**, reduced opacity

> AI text should feel **easy on the eyes**, not “dense”.

---

## 5️⃣ Emphasis System (Fun but Controlled)

| Purpose       | Rule                          |
| ------------- | ----------------------------- |
| Bold emphasis | Use **600**, never 700        |
| Highlight     | Color-based, not size-based   |
| Emoji use     | Max **1 emoji per paragraph** |
| ALL CAPS      | Only for overline labels      |

---

## 6️⃣ Spacing Rules for Text Blocks

| Element               | Spacing |
| --------------------- | ------- |
| Title → Body          | 12–16px |
| Paragraph → Paragraph | 8–12px  |
| Section → Section     | 24–32px |

**Golden Rule:**

> If text feels cramped, increase **line height before font size**

---

## 7️⃣ Accessibility Rules (Non-Negotiable)

* Minimum text size: **14px**
* Contrast ratio: **4.5:1**
* Never rely on color alone to convey meaning
* Avoid ultra-light fonts (<400)

---

## 8️⃣ Design Tokens (Figma-Ready)

```
font-display: 32 / 40 / 700
font-h1: 28 / 36 / 700
font-h2: 24 / 32 / 600
font-h3: 20 / 28 / 600
font-body-lg: 18 / 28 / 400
font-body: 16 / 24 / 400
font-body-sm: 14 / 20 / 400
font-caption: 12 / 16 / 400
font-overline: 11 / 16 / 500
```

---

## 9️⃣ Personality Summary (Xum AI Text Feel)

* **Readable first**
* **Warm intelligence**
* **Conversational but professional**
* **No shouting**
* **No clutter**
