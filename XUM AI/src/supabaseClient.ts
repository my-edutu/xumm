import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CREDENTIAL RETRIEVAL
// ============================================================================

const getSupabaseUrl = (): string => {
  // Expo uses process.env for EXPO_PUBLIC_ variables
  // Vite also populates process.env in many configurations, or we can fallback
  return process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://placeholder.supabase.co';
};

const getSupabaseAnonKey = (): string => {
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'placeholder-key';
};

// ============================================================================
// VALIDATION
// ============================================================================

const isValidUrl = (url: string): boolean => {
  if (!url || url.includes('placeholder')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return !!key && key.length > 20 && !key.includes('placeholder');
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

const hasValidCredentials = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

if (!hasValidCredentials) {
  console.warn('[Supabase] ⚠️ Missing or invalid credentials. Check your .env file.');
}

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = hasValidCredentials;
