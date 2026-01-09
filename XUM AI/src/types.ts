/**
 * XUM AI Type Definitions
 * Centralized type definitions for the entire application.
 */

// ============================================================================
// NAVIGATION
// ============================================================================

export enum ScreenName {
  // Auth Flow
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  OTP_VERIFICATION = 'OTP_VERIFICATION',

  // Main User Flow
  HOME = 'HOME',
  TASK_MARKETPLACE = 'TASK_MARKETPLACE',
  TASK_DETAILS = 'TASK_DETAILS',
  TASK_SUBMISSION = 'TASK_SUBMISSION',
  WALLET = 'WALLET',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  NOTIFICATIONS = 'NOTIFICATIONS',
  WITHDRAW = 'WITHDRAW',
  REFERRALS = 'REFERRALS',
  SUPPORT = 'SUPPORT',
  SUBMISSION_TRACKER = 'SUBMISSION_TRACKER',

  // Task Execution Flow
  CREATE_TASK = 'CREATE_TASK',
  LINGUASENSE = 'LINGUASENSE',
  LANGUAGE_RUNNER = 'LANGUAGE_RUNNER',
  CAPTURE_CHOICE = 'CAPTURE_CHOICE',
  CAPTURE_AUDIO = 'CAPTURE_AUDIO',
  MEDIA_CAPTURE = 'MEDIA_CAPTURE',
  HYBRID_CAPTURE = 'HYBRID_CAPTURE',
  CAPTURE_VIDEO = 'CAPTURE_VIDEO',
  TEXT_INPUT_TASK = 'TEXT_INPUT_TASK',
  VALIDATION_TASK = 'VALIDATION_TASK',
  TASK_SUCCESS = 'TASK_SUCCESS',
  XUM_JUDGE = 'XUM_JUDGE',
  RLHF_CORRECTION = 'RLHF_CORRECTION',

  // Admin Flow
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_USER_MANAGEMENT = 'ADMIN_USER_MANAGEMENT',
  ADMIN_TASK_MODERATION = 'ADMIN_TASK_MODERATION',
  ADMIN_PAYOUTS = 'ADMIN_PAYOUTS',

  // Company/Enterprise Flow (Future)
  LINGUASENSE_PORTAL = 'LINGUASENSE_PORTAL',
  COMPANY_DASHBOARD = 'COMPANY_DASHBOARD',
}

// ============================================================================
// USER & PROFILE
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  balance: number;
  level: number;
  current_xp: number;
  target_xp: number;
  role: 'worker' | 'admin' | 'contributor';
  precision_score?: number;
  total_tasks_completed?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// TASKS
// ============================================================================

export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard';
export type TaskType = 'audio' | 'text' | 'image' | 'validation' | 'linguasense' | 'video' | 'rlhf';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  xp: number;
  timeEstimate: string;
  difficulty: TaskDifficulty;
  type: TaskType;
  priority?: boolean;
  created_at?: string;
  expires_at?: string;
}

export interface LinguasenseTask {
  id: string;
  prompt: string;
  context?: string;
  type: 'text' | 'voice' | 'both';
  reward: number;
  xp: number;
  targetLanguage: string;
}

// ============================================================================
// TRANSACTIONS & WALLET
// ============================================================================

export type TransactionType = 'earn' | 'withdraw' | 'bonus' | 'referral';

export interface Transaction {
  id?: string;
  title: string;
  date: string;
  amount: string;
  type: TransactionType;
  icon: string;
  color: string;
  created_at?: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  account_details: Record<string, unknown>;
  created_at: string;
  processed_at?: string;
}

// ============================================================================
// THEME & UI
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  primary: string;
  bg: string;
  surface: string;
  cardGradient: string;
}

// ============================================================================
// COMMON PROPS
// ============================================================================

export interface BaseScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export interface DashboardScreenProps extends BaseScreenProps {
  balance?: number;
  history?: Transaction[];
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  activeThemeId?: string;
  setActiveThemeId?: (id: string) => void;
  themes?: Theme[];
  profile?: UserProfile | null;
}

export interface TaskScreenProps extends BaseScreenProps {
  onCompleteTask?: (reward: number, xp: number) => void;
}
