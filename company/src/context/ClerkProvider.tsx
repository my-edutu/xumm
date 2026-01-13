/**
 * Clerk Authentication Provider for Web (Company Portal)
 * 
 * This wraps the company portal with Clerk authentication.
 * Includes email domain validation for @xumai.app emails.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider as ClerkProviderBase, useUser, useAuth, useClerk, SignedIn, SignedOut, SignIn, SignUp, UserButton } from '@clerk/clerk-react';
import { supabase } from '../supabaseClient';

// Get the publishable key from environment
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Email domain validation
const ALLOWED_COMPANY_DOMAINS = ['xumai.app', 'xumai.com'];

interface ClerkContextType {
    isValidCompanyEmail: (email: string) => boolean;
    isCompanyUser: boolean;
}

const ClerkContext = createContext<ClerkContextType>({
    isValidCompanyEmail: () => false,
    isCompanyUser: false,
});

export const useClerkContext = () => useContext(ClerkContext);

/**
 * Validates if the email belongs to an allowed company domain
 */
const isValidCompanyEmail = (email: string): boolean => {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_COMPANY_DOMAINS.includes(domain);
};

/**
 * Component to sync Clerk user to Supabase with company role
 */
const ClerkSupabaseSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoaded } = useUser();
    const [isCompanyUser, setIsCompanyUser] = useState(false);

    useEffect(() => {
        if (!isLoaded || !user) {
            setIsCompanyUser(false);
            return;
        }

        const email = user.primaryEmailAddress?.emailAddress || '';
        const validCompany = isValidCompanyEmail(email);
        setIsCompanyUser(validCompany);

        if (!validCompany) {
            console.warn('[ClerkSync] User email domain not allowed for company portal:', email);
            return;
        }

        const syncUserToSupabase = async () => {
            try {
                const userData = {
                    id: user.id,
                    email,
                    full_name: user.fullName || user.firstName || 'Company User',
                    avatar_url: user.imageUrl || null,
                    role: 'company', // Set role as company user
                    updated_at: new Date().toISOString(),
                };

                // Check if user already exists
                const { data: existing } = await supabase
                    .from('users')
                    .select('id, role')
                    .eq('email', email)
                    .maybeSingle();

                if (existing) {
                    // Update existing record
                    const { error } = await supabase
                        .from('users')
                        .update({ ...userData, role: existing.role || 'company' }) // Preserve existing role if set
                        .eq('email', email);
                    if (error) {
                        console.error('[ClerkSync] Error updating company user:', error);
                    } else {
                        console.log('[ClerkSync] Company user updated:', user.id);
                    }
                } else {
                    // Insert new company user
                    const { error } = await supabase.from('users').insert(userData);
                    if (error) {
                        console.error('[ClerkSync] Error creating company user:', error);
                    } else {
                        console.log('[ClerkSync] Company user created:', user.id);
                    }
                }
            } catch (err) {
                console.error('[ClerkSync] Sync error:', err);
            }
        };

        syncUserToSupabase();
    }, [user, isLoaded]);

    return (
        <ClerkContext.Provider value={{ isValidCompanyEmail, isCompanyUser }}>
            {children}
        </ClerkContext.Provider>
    );
};

/**
 * Main Clerk Provider component for Company Portal
 */
export const ClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!clerkPublishableKey) {
        console.warn('[Clerk] Missing publishable key! Using fallback auth.');
        return <>{children}</>;
    }

    return (
        <ClerkProviderBase publishableKey={clerkPublishableKey}>
            <ClerkSupabaseSync>
                {children}
            </ClerkSupabaseSync>
        </ClerkProviderBase>
    );
};

// Re-export Clerk hooks and components
export { useUser, useAuth, useClerk, SignedIn, SignedOut, SignIn, SignUp, UserButton, isValidCompanyEmail };
