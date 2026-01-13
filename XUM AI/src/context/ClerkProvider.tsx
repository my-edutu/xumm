/**
 * Clerk Authentication Provider
 * 
 * This wraps the app with Clerk authentication.
 * Following the official Clerk Expo documentation.
 */

import React, { useEffect } from 'react';
import { ClerkProvider as ClerkProviderBase, ClerkLoaded, useUser, useAuth, useClerk, useSignIn, useSignUp, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { supabase } from '../supabaseClient';

// Get the publishable key from environment
const getClerkPublishableKey = (): string => {
    // 1. Try Expo/Metro environment (Primary for React Native)
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    }

    // 2. Try Vite environment (Fallback for potential pure web builds)
    try {
        // Use an indirect check to prevent Hermes from failing at the parsing stage
        // In Expo, process.env is the source of truth for variables prefixed with EXPO_PUBLIC_
        const env = (process as any).env || {};
        if (env.VITE_CLERK_PUBLISHABLE_KEY) return env.VITE_CLERK_PUBLISHABLE_KEY;
    } catch (e) { }

    console.warn('[Clerk] No publishable key found in environment. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    return '';
};

const publishableKey = getClerkPublishableKey();

/**
 * Component to sync Clerk user to Supabase
 * This ensures the user exists in Supabase's users table
 */
const ClerkSupabaseSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user) return;

        const syncUserToSupabase = async () => {
            try {
                const email = user.primaryEmailAddress?.emailAddress || '';
                const userData = {
                    id: user.id,
                    email,
                    full_name: user.fullName || user.firstName || 'Contributor',
                    avatar_url: user.imageUrl || null,
                    updated_at: new Date().toISOString(),
                };

                // Check if user already exists by email (handles Clerk ID changes)
                const { data: existing } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (existing && existing.id !== user.id) {
                    // Update existing record's Clerk ID and other fields
                    const { error } = await supabase
                        .from('users')
                        .update({ ...userData, id: user.id })
                        .eq('email', email);
                    if (error) {
                        console.error('[ClerkSync] Error updating existing user:', error);
                    } else {
                        console.log('[ClerkSync] Updated existing user with new Clerk ID:', user.id);
                    }
                } else {
                    // Upsert normally by ID
                    const { error } = await supabase.from('users').upsert(userData, { onConflict: 'id' });
                    if (error) {
                        console.error('[ClerkSync] Error syncing user to Supabase:', error);
                    } else {
                        console.log('[ClerkSync] User synced to Supabase:', user.id);
                    }
                }
            } catch (err) {
                console.error('[ClerkSync] Sync error:', err);
            }
        };

        syncUserToSupabase();
    }, [user, isLoaded]);

    return <>{children}</>;
};

/**
 * Main Clerk Provider component
 * Uses the token cache from @clerk/clerk-expo/token-cache as recommended
 */
export const ClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!publishableKey) {
        console.error('[Clerk] Missing publishable key! Auth will not work.');
        return <>{children}</>;
    }

    return (
        <ClerkProviderBase publishableKey={publishableKey} tokenCache={tokenCache}>
            <ClerkLoaded>
                <ClerkSupabaseSync>
                    {children}
                </ClerkSupabaseSync>
            </ClerkLoaded>
        </ClerkProviderBase>
    );
};

// Re-export Clerk hooks and components for convenience
export { useUser, useAuth, useClerk, useSignIn, useSignUp, SignedIn, SignedOut };
