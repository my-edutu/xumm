# XUM AI - Application Structure
**Technical Architecture Documentation**

---

## 📦 Project Overview

**Platform**: Cross-platform mobile web application (iOS & Android)  
**Framework**: React 19 + TypeScript  
**Build Tool**: Vite  
**Styling**: Tailwind CSS (via inline styles)  
**State Management**: React Hooks (useState, useEffect)  
**Backend**: Supabase (PostgreSQL + Auth + Storage)

---

## 🗂️ Directory Structure

```
xum-ai/
├── doc/                          # Documentation
│   ├── design.md                # Design system & UX
│   ├── app-structure.md         # This file
│   ├── backend-architecture.md  # Backend design
│   ├── ux-flow.md              # User journey maps
│   └── xum PRD.md              # Product requirements
│
├── agents/                      # AI agent configurations
│   ├── frontend-agent.md
│   ├── backend-agent.md
│   ├── design-agent.md
│   ├── testing-agent.md
│   └── devops-agent.md
│
├── screens/                     # React screen components
│   ├── AuthScreens.tsx         # Authentication flow
│   ├── DashboardScreens.tsx    # User dashboard & wallet
│   ├── TaskScreens.tsx         # Task execution interfaces
│   ├── AdminScreens.tsx        # Admin panel
│   └── CompanyScreens.tsx      # Enterprise dashboard
│
├── components/                  # Reusable UI components
│   └── (to be populated)
│
├── supabase/                   # Database & backend
│   ├── schema.sql             # Database schema
│   └── task.sql               # Task-specific queries
│
├── App.tsx                     # Root application component
├── index.tsx                   # Entry point
├── types.ts                    # TypeScript type definitions
├── package.json               # Dependencies
├── vite.config.ts             # Build configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🧩 Component Hierarchy

### App.tsx (Root)
```
App (State Manager)
├── Theme Controller (useEffect)
├── Screen Router (renderScreen)
│   ├── Authentication Flow
│   │   ├── SplashScreen
│   │   ├── OnboardingScreen
│   │   ├── AuthScreen
│   │   ├── ForgotPasswordScreen
│   │   └── OTPScreen
│   │
│   ├── User Dashboard
│   │   ├── HomeScreen
│   │   ├── WalletScreen
│   │   ├── ProfileScreen
│   │   ├── LeaderboardScreen
│   │   ├── SubmissionTrackerScreen
│   │   ├── SettingsScreen
│   │   ├── NotificationsScreen
│   │   ├── WithdrawScreen
│   │   ├── ReferralScreen
│   │   └── SupportScreen
│   │
│   ├── Task System
│   │   ├── TaskMarketplaceScreen
│   │   ├── TaskDetailsScreen
│   │   ├── CreateTaskScreen
│   │   ├── Task Execution Variants:
│   │   │   ├── CaptureAudioScreen
│   │   │   ├── MediaCaptureScreen
│   │   │   ├── HybridCaptureScreen
│   │   │   ├── TextInputTaskScreen
│   │   │   ├── ValidationTaskScreen
│   │   │   ├── XUMJudgeTaskScreen
│   │   │   └── RLHFCorrectionTaskScreen
│   │   ├── LinguasenseScreen
│   │   ├── LanguageTaskRunnerScreen
│   │   ├── TaskSubmissionScreen
│   │   └── TaskSuccessScreen
│   │
│   └── Admin Panel
│       ├── AdminLoginScreen
│       ├── AdminDashboardScreen
│       ├── UserManagementScreen
│       ├── TaskModerationScreen
│       └── AdminPayoutsScreen
```

---

## 🔄 State Management

### Global State (App.tsx)

```typescript
// Navigation State
currentScreen: ScreenName

// User Data
balance: number
history: Transaction[]

// Theme System
isDarkMode: boolean
activeThemeId: string
themes: Theme[]

// Handlers
navigate: (screen: ScreenName) => void
handleWithdraw: (amount: number, method: string) => void
handleCompleteTask: (reward: number, xp: number) => void
```

### ScreenName Enum

Centralized navigation constants in `types.ts`:

```typescript
enum ScreenName {
  // Auth Flow
  SPLASH, ONBOARDING, AUTH, FORGOT_PASSWORD, OTP_VERIFICATION,
  
  // User Flow
  HOME, WALLET, PROFILE, SETTINGS, LEADERBOARD, 
  SUBMISSION_TRACKER, NOTIFICATIONS, WITHDRAW, REFERRALS, SUPPORT,
  
  // Task Flow
  TASK_MARKETPLACE, TASK_DETAILS, CREATE_TASK,
  CAPTURE_AUDIO, MEDIA_CAPTURE, HYBRID_CAPTURE, CAPTURE_CHOICE,
  TEXT_INPUT_TASK, VALIDATION_TASK, TASK_SUBMISSION, TASK_SUCCESS,
  LINGUASENSE, LANGUAGE_RUNNER, XUM_JUDGE, RLHF_CORRECTION,
  
  // Admin Flow
  ADMIN_LOGIN, ADMIN_DASHBOARD, ADMIN_USER_MANAGEMENT,
  ADMIN_TASK_MODERATION, ADMIN_PAYOUTS
}
```

---

## 🎨 Theme System

### Dynamic CSS Injection

Themes are applied via CSS custom properties injected into `<head>`:

```typescript
useEffect(() => {
  const theme = THEMES.find(t => t.id === activeThemeId);
  
  document.head.innerHTML += `
    <style id="xum-theme-overrides">
      :root {
        --primary-theme: ${theme.primary};
        --bg-custom-dark: ${theme.bg};
        --surface-custom-dark: ${theme.surface};
        --card-gradient: ${theme.cardGradient};
      }
    </style>
  `;
}, [activeThemeId]);
```

### Available Themes

6 pre-configured themes:
1. Midnight (default) - Blue
2. Emerald - Green
3. Solar - Orange
4. Amoled - Pure Black
5. Night - Slate Gray
6. Crimson - Red

---

## 📡 Data Flow Architecture

### Authentication Flow

```
User Input (Email/Password)
  ↓
AuthScreen Component
  ↓
[Future] Supabase Auth API
  ↓
JWT Token Storage
  ↓
Navigate to HOME
```

### Task Execution Flow

```
Task Selection (Marketplace)
  ↓
TaskDetailsScreen (Load task data)
  ↓
Task Execution Screen (Type-specific)
  │ - Audio Recording → CaptureAudioScreen
  │ - Image Labeling → MediaCaptureScreen
  │ - Text Input → TextInputTaskScreen
  │ - Validation → ValidationTaskScreen
  │ - RLHF → RLHFCorrectionTaskScreen
  ↓
Submission → [Future] POST /api/v1/submissions
  ↓
Success Callback → handleCompleteTask(reward, xp)
  ↓
Update Global State (balance, history)
  ↓
Navigate to TaskSuccessScreen
```

### Withdrawal Flow

```
WalletScreen → Tap "Withdraw"
  ↓
WithdrawScreen (Select method + amount)
  ↓
Validation (MIN: $5, MAX: current balance)
  ↓
onConfirm → handleWithdraw(amount, method)
  ↓
Update State:
  - balance -= amount
  - history.unshift(new transaction)
  ↓
[Future] POST /api/v1/withdrawals
  ↓
Navigate back to WALLET
```

---

## 🔌 API Integration Points (Future)

### User Endpoints
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/verify-otp
GET    /api/v1/users/me
PUT    /api/v1/users/me
```

### Task Endpoints
```
GET    /api/v1/tasks (with filters: type, difficulty, priority)
GET    /api/v1/tasks/:id
POST   /api/v1/tasks (Admin/Company only)
POST   /api/v1/submissions
GET    /api/v1/submissions/me
```

### Financial Endpoints
```
GET    /api/v1/wallet/balance
GET    /api/v1/wallet/history
POST   /api/v1/withdrawals
GET    /api/v1/withdrawals/me
```

### Admin Endpoints
```
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/:id/status
GET    /api/v1/admin/submissions?status=pending
PUT    /api/v1/admin/submissions/:id/review
GET    /api/v1/admin/payouts
POST   /api/v1/admin/payouts/batch-approve
```

---

## 🏗️ Screen Categories

### 1. Authentication Screens (AuthScreens.tsx)
- **Purpose**: User onboarding and access control
- **Screens**: Splash, Onboarding, Auth, Forgot Password, OTP
- **Key Features**:
  - Cinematic splash with SVG animations
  - Multi-slide onboarding with T&C acceptance
  - Password visibility toggles
  - Social auth (Google integration)

### 2. Dashboard Screens (DashboardScreens.tsx)
- **Purpose**: User profile and account management
- **Screens**: Home, Wallet, Profile, Settings, Leaderboard, etc.
- **Key Features**:
  - Balance display with transaction history
  - XP/Level progress tracking
  - Theme switcher integration
  - Referral code generation

### 3. Task Screens (TaskScreens.tsx)
- **Purpose**: Task discovery and execution
- **Screens**: Marketplace, Task Details, Capture variants, Success
- **Key Features**:
  - Filterable task marketplace
  - Type-specific task interfaces (audio, image, text)
  - Real-time recording/input capture
  - Reward animation on completion

### 4. Admin Screens (AdminScreens.tsx)
- **Purpose**: Platform moderation and management
- **Screens**: Admin Dashboard, User Management, Task Moderation, Payouts
- **Key Features**:
  - User account control (suspend/ban)
  - Submission review queue
  - Batch payout approval
  - Platform analytics

### 5. Company Screens (CompanyScreens.tsx)
- **Purpose**: Enterprise task management
- **Status**: Placeholder (to be implemented)
- **Planned Features**:
  - Project creation
  - Budget management
  - Worker assignment
  - Quality monitoring

---

## 🎯 Navigation Patterns

### Bottom Navigation (User Flow)
```
Home | Tasks | Wallet | Profile | Settings
```

### Back Navigation
```typescript
navigate(ScreenName.HOME) // Return to dashboard
window.scrollTo(0, 0)     // Reset scroll position
```

### Admin Access
```
Separate login flow → AdminLoginScreen
Dedicated admin navigation structure
```

---

## 📊 Data Models (types.ts)

### Task Interface
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  xp: number;
  timeEstimate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'audio' | 'text' | 'image' | 'validation' | 'linguasense';
  priority?: boolean;
}
```

### User Interface
```typescript
interface User {
  name: string;
  level: number;
  currentXp: number;
  targetXp: number;
  balance: number;
}
```

### Transaction History (Implicit)
```typescript
interface Transaction {
  title: string;
  date: string;
  amount: string; // "+$X.XX" or "-$X.XX"
  type: 'earn' | 'withdraw';
  icon: string; // Material Symbol name
  color: string; // 'blue' | 'red' | 'purple' | 'emerald'
}
```

---

## 🚦 Performance Considerations

### Code Splitting
- Currently single-bundle via Vite
- **Future**: Lazy load screens with React.lazy()

### Asset Optimization
- Use WebP for images
- Inline critical CSS
- Defer non-essential Material Symbols

### State Optimization
```typescript
// Avoid unnecessary re-renders
const memoizedTheme = useMemo(() => 
  THEMES.find(t => t.id === activeThemeId), 
  [activeThemeId]
);
```

---

## 🔐 Security Architecture

### Authentication (Future)
- JWT tokens stored in localStorage (for web)
- Secure HTTP-only cookies (production)
- Token refresh logic

### Input Validation
- Client-side validation for forms
- Server-side validation (API layer)
- SQL injection prevention via parameterized queries

### Admin Access Control
- Role-based permissions (RBAC)
- Separate admin authentication flow
- Audit logs for sensitive operations

---

## 🧪 Testing Strategy

### Unit Tests
- Component rendering (React Testing Library)
- State management logic
- Utility functions

### Integration Tests
- Navigation flow
- Theme switching
- Balance updates after task completion

### E2E Tests (Future)
- Full user journey: Signup → Task → Withdraw
- Admin moderation workflow
- Cross-browser compatibility

---

## 📱 Mobile Optimization

### Responsive Design
```css
max-w-md    /* Mobile: 448px */
md:max-w-5xl /* Tablet: 896px */
lg:max-w-6xl /* Desktop: 1152px */
```

### Touch Interactions
- 48px minimum touch targets
- Swipe gestures for navigation (future)
- Haptic feedback (iOS)

### Performance
- Smooth 60fps animations
- Optimized bundle size (~200KB gzipped)
- Lazy loading for heavy components

---

## 🔄 Development Workflow

### Local Development
```bash
npm install         # Install dependencies
npm run dev        # Start dev server (port 5173)
```

### Build & Deploy
```bash
npm run build      # Production build
npm run preview    # Preview production build
```

### Environment Variables
```
GEMINI_API_KEY     # For AI features
SUPABASE_URL       # Database connection
SUPABASE_ANON_KEY  # Public API key
```

---

## 🚀 Deployment Architecture

### Frontend
- **Platform**: Vercel / Netlify
- **CDN**: Automatic edge deployment
- **Domain**: xum-ai.app (example)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (task media)
- **Functions**: Edge Functions for serverless logic

---

## 📈 Future Enhancements

1. **Component Library**: Extract reusable components (Button, Card, Input)
2. **State Management**: Migrate to Zustand/Redux for complex state
3. **Offline Support**: PWA with service workers
4. **Push Notifications**: FCM integration for task alerts
5. **Real-time Updates**: WebSocket for live leaderboard
6. **Analytics**: Mixpanel/Amplitude integration
7. **Error Tracking**: Sentry integration

---

**Last Updated**: December 30, 2025  
**Technical Lead**: XUM AI Dev Team  
**Version**: 1.0
