import { Resend } from 'resend';
import ReactNative from 'react-native';
const { Platform } = ReactNative;

/**
 * Mailer Utility
 * Simple wrapper for Resend to send emails from the client (for development/admin actions)
 * NOTE: In a production environment, this should be handled by a Supabase Edge Function
 * for better security and to keep API keys hidden.
 */

const getResendKey = () => {
    // 1. Try Node/Metro environment (Primary for Expo/React Native)
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.EXPO_PUBLIC_RESEND_API_KEY) return process.env.EXPO_PUBLIC_RESEND_API_KEY;
        if (process.env.VITE_RESEND_API_KEY) return process.env.VITE_RESEND_API_KEY;
    }

    // 2. Try Vite environment (Fallback for pure web builds if any)
    try {
        const meta = (global as any).import?.meta || {};
        const env = (meta as any).env || {};
        if (env.VITE_RESEND_API_KEY) return env.VITE_RESEND_API_KEY;
        if (env.EXPO_PUBLIC_RESEND_API_KEY) return env.EXPO_PUBLIC_RESEND_API_KEY;
    } catch (e) { }

    return '';
};

// Lazily initialize Resend to avoid top-level crashes on mobile
let resendInstance: any = null;
const getResendInstance = () => {
    if (resendInstance) return resendInstance;
    const resendKey = getResendKey();
    if (!resendKey) return null;
    try {
        // Only initialize on platforms where it's safe or if specifically needed
        // Standard Resend SDK might use Node modules, so we wrap it in a try-catch
        resendInstance = new Resend(resendKey);
        return resendInstance;
    } catch (e) {
        console.warn('[Mailer] Failed to initialize Resend SDK:', e);
        return null;
    }
};

export const sendAuthEmail = async (to: string, type: 'VERIFY' | 'WELCOME' | 'RESET', data: any = {}) => {
    const resend = getResendInstance();
    if (!resend) {
        console.warn('[Mailer] Resend API key not found or initialization failed. Email not sent.');
        return { error: 'Mailer unavailable' };
    }

    let subject = 'XUM AI Notification';
    let html = '';

    switch (type) {
        case 'VERIFY':
            subject = 'Verify your XUM AI Account';
            html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #1349ec;">Welcome to XUM AI</h2>
                    <p>Thank you for signing up! Please verify your email to unlock the neural marketplace.</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <p style="font-size: 14px; color: #666;">If you signed up on mobile, you can usually just wait for the app to detect your login. Otherwise, check your account in the dashboard.</p>
                    </div>
                    <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
                </div>
            `;
            break;
        case 'WELCOME':
            subject = 'Welcome to the Neural Network! 🚀';
            html = `<h1>Hi ${data.name || 'User'},</h1><p>Welcome to XUM AI. Start contributing and earning today!</p>`;
            break;
    }

    // Prevent CORS errors on Web by skipping the direct Resend call
    if (Platform.OS === 'web') {
        console.log('[Mailer] Skipping direct Resend call on Web to avoid CORS. Ensure Supabase SMTP is configured.');
        return { data: { message: 'Skipped on web' } };
    }

    try {
        const result = await resend.emails.send({
            from: 'XUM AI <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
        });
        return { data: result };
    } catch (error) {
        console.error('[Mailer] Error sending email:', error);
        return { error };
    }
};
