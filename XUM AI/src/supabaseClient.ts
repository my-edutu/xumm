import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

type Environment = 'development' | 'production' | 'test';

const getEnvironment = (): Environment => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    return import.meta.env.MODE as Environment;
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV as Environment;
  }
  return 'development';
};

// ============================================================================
// CREDENTIAL RETRIEVAL
// ============================================================================

const getSupabaseUrl = (): string => {
  // Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  // Expo environment
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) {
    return process.env.EXPO_PUBLIC_SUPABASE_URL;
  }
  return '';
};

const getSupabaseAnonKey = (): string => {
  // Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  // Expo environment
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  }
  return '';
};

// ============================================================================
// VALIDATION
// ============================================================================

const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && url.includes('supabase');
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return typeof key === 'string' && key.length > 20;
};

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key-for-prototype-mode';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const environment = getEnvironment();

// Validate credentials
const hasValidCredentials = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

// In production, provide a warning if credentials are missing instead of crashing
if (environment === 'production' && !hasValidCredentials) {
  console.warn(
    '[Supabase] ⚠️ FATAL Warning: Missing or invalid Supabase credentials in production. ' +
    'Running in prototype mode. UI will work but backend calls will fail.'
  );
}

// In development, warn and use placeholder
if (!hasValidCredentials) {
  console.warn(
    '[Supabase] ⚠️ Invalid or missing credentials. Running in prototype mode.\n' +
    'To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

const finalUrl = hasValidCredentials ? supabaseUrl : PLACEHOLDER_URL;
const finalKey = hasValidCredentials ? supabaseAnonKey : PLACEHOLDER_KEY;

// ============================================================================
// EXPORT
// ============================================================================

export const supabase: SupabaseClient = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = hasValidCredentials;
