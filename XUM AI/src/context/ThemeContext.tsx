import React from 'react';

export interface ThemeColors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
}

export type ThemeId = 'midnight' | 'emerald' | 'solar' | 'amoled' | 'night' | 'crimson' | 'light';

// All themes share same dark background, only accent changes
export const DARK_BG = '#0a0a0f';
export const DARK_SURFACE = '#111118';
export const DARK_BORDER = '#1a1a22';

// Light mode colors
export const LIGHT_BG = '#ffffff';
export const LIGHT_SURFACE = '#f8fafc';
export const LIGHT_BORDER = '#e2e8f0';

export const themePresets: Record<ThemeId, ThemeColors> = {
    midnight: {
        primary: '#1349ec',
        primaryDark: '#0e36b5',
        primaryLight: '#3b6bff',
        background: DARK_BG,
        surface: DARK_SURFACE,
        border: DARK_BORDER,
        text: '#ffffff',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f97316',
        error: '#ef4444',
        accent: '#1349ec',
    },
    emerald: {
        primary: '#10b981',
        primaryDark: '#059669',
        primaryLight: '#34d399',
        background: DARK_BG,
        surface: DARK_SURFACE,
        border: DARK_BORDER,
        text: '#ffffff',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f97316',
        error: '#ef4444',
        accent: '#10b981',
    },
    solar: {
        primary: '#f59e0b',
        primaryDark: '#d97706',
        primaryLight: '#fbbf24',
        background: DARK_BG,
        surface: DARK_SURFACE,
        border: DARK_BORDER,
        text: '#ffffff',
        textSecondary: '#a8a29e',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        accent: '#f59e0b',
    },
    amoled: {
        primary: '#6366f1',  // Changed from white for better contrast
        primaryDark: '#4f46e5',
        primaryLight: '#818cf8',
        background: '#000000',
        surface: '#0a0a0a',
        border: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a1a1aa',  // Improved contrast
        success: '#22c55e',
        warning: '#f97316',
        error: '#ef4444',
        accent: '#6366f1',
    },
    night: {
        primary: '#8b5cf6',
        primaryDark: '#7c3aed',
        primaryLight: '#a78bfa',
        background: DARK_BG,
        surface: DARK_SURFACE,
        border: DARK_BORDER,
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        success: '#10b981',
        warning: '#f97316',
        error: '#ef4444',
        accent: '#8b5cf6',
    },
    crimson: {
        primary: '#f43f5e',
        primaryDark: '#e11d48',
        primaryLight: '#fb7185',
        background: DARK_BG,
        surface: DARK_SURFACE,
        border: DARK_BORDER,
        text: '#ffffff',
        textSecondary: '#a8a29e',
        success: '#10b981',
        warning: '#f97316',
        error: '#f43f5e',
        accent: '#f43f5e',
    },
    light: {
        primary: '#1349ec',
        primaryDark: '#0e36b5',
        primaryLight: '#3b6bff',
        background: LIGHT_BG,
        surface: LIGHT_SURFACE,
        border: LIGHT_BORDER,
        text: '#0f172a',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f97316',
        error: '#ef4444',
        accent: '#1349ec',
    },
};

export interface ThemeContextType {
    theme: ThemeColors;
    themeId: ThemeId;
    setTheme: (id: ThemeId) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
    theme: themePresets.midnight,
    themeId: 'midnight',
    setTheme: () => { },
});

export const useTheme = () => React.useContext(ThemeContext);
