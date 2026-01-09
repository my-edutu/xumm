/**
 * XUM AI - Auth Screens (Pure React Native)
 * 
 * Converted from NativeWind to React Native StyleSheet for APK compatibility.
 * Maintains exact same design, animations, and functionality.
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Dimensions,
    Animated,
    Image as RNImage,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { ScreenName } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface ScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

// ============================================================================
// THEME COLORS (Determined by context)
// ============================================================================

// ============================================================================
// SPLASH SCREEN
// ============================================================================

/**
 * Logo coordinate map for particle animation
 * Particles will gather towards these points, then fade into solid text.
 */
const LOGO_MAP = [
    // X
    { x: 10, y: 30 }, { x: 15, y: 35 }, { x: 20, y: 40 }, { x: 25, y: 45 }, { x: 30, y: 50 }, { x: 35, y: 55 }, { x: 40, y: 60 },
    { x: 40, y: 30 }, { x: 35, y: 35 }, { x: 30, y: 40 }, { x: 20, y: 50 }, { x: 15, y: 55 }, { x: 10, y: 60 },
    // U
    { x: 50, y: 30 }, { x: 50, y: 35 }, { x: 50, y: 40 }, { x: 50, y: 45 }, { x: 50, y: 50 }, { x: 55, y: 55 }, { x: 60, y: 60 }, { x: 65, y: 60 }, { x: 70, y: 55 }, { x: 75, y: 50 }, { x: 75, y: 45 }, { x: 75, y: 40 }, { x: 75, y: 35 }, { x: 75, y: 30 },
    // M
    { x: 85, y: 60 }, { x: 85, y: 55 }, { x: 85, y: 50 }, { x: 85, y: 45 }, { x: 85, y: 40 }, { x: 85, y: 35 }, { x: 85, y: 30 },
    { x: 90, y: 35 }, { x: 95, y: 40 }, { x: 100, y: 45 }, { x: 105, y: 40 }, { x: 110, y: 35 },
    { x: 115, y: 30 }, { x: 115, y: 35 }, { x: 115, y: 40 }, { x: 115, y: 45 }, { x: 115, y: 50 }, { x: 115, y: 55 }, { x: 115, y: 60 },
    // A
    { x: 135, y: 60 }, { x: 135, y: 55 }, { x: 135, y: 50 }, { x: 135, y: 45 }, { x: 140, y: 40 }, { x: 145, y: 35 }, { x: 150, y: 30 }, { x: 155, y: 35 }, { x: 160, y: 40 }, { x: 165, y: 45 }, { x: 165, y: 50 }, { x: 165, y: 55 }, { x: 165, y: 60 },
    { x: 142, y: 48 }, { x: 148, y: 48 }, { x: 154, y: 48 }, { x: 160, y: 48 },
    // I
    { x: 175, y: 30 }, { x: 180, y: 30 }, { x: 185, y: 30 },
    { x: 180, y: 35 }, { x: 180, y: 40 }, { x: 180, y: 45 }, { x: 180, y: 50 }, { x: 180, y: 55 },
    { x: 175, y: 60 }, { x: 180, y: 60 }, { x: 185, y: 60 },
];

export const SplashScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [phase, setPhase] = useState<'scattered' | 'forming' | 'stable'>('scattered');
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.9)).current;
    const particleOpacity = useRef(new Animated.Value(1)).current;

    const particles = useMemo(() => {
        return Array.from({ length: 800 }).map((_, i) => {
            const targetPoint = LOGO_MAP[i % LOGO_MAP.length];
            const scale = 0.28;
            const jitterX = (Math.random() - 0.5) * 1.5;
            const jitterY = (Math.random() - 0.5) * 1.5;

            return {
                id: i,
                size: Math.random() * 2 + 1,
                initialX: Math.random() * 100,
                initialY: Math.random() * 100,
                targetX: 50 + (targetPoint.x - 100) * scale + jitterX,
                targetY: 48 + (targetPoint.y - 45) * scale + jitterY,
                delay: Math.random() * 1200,
                duration: 2200 + Math.random() * 1800,
            };
        });
    }, []);

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase('forming'), 1200);
        const timer2 = setTimeout(() => {
            setPhase('stable');
            // Fade in logo, fade out particles
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(particleOpacity, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 5200);
        const timer3 = setTimeout(() => onNavigate(ScreenName.ONBOARDING), 8200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onNavigate, logoOpacity, logoScale, particleOpacity]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[splashStyles.container, { backgroundColor: theme.background }]}
            onPress={() => onNavigate(ScreenName.ONBOARDING)}
        >
            <View style={[splashStyles.background, { backgroundColor: theme.background }]} />

            {/* Glow Effect */}
            <View style={splashStyles.glowContainer} pointerEvents="none">
                <View style={[splashStyles.glowCircle, { backgroundColor: `${theme.primary}10` }]} />
            </View>

            {/* Solid Logo Text */}
            <Animated.View
                style={[
                    splashStyles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Text style={[splashStyles.logoText, { color: theme.text }]}>XUM AI</Text>
            </Animated.View>

            {/* Particle Animation */}
            <Animated.View
                style={[splashStyles.particleContainer, { opacity: particleOpacity }]}
                pointerEvents="none"
            >
                {particles.map((p) => {
                    const isTarget = phase !== 'scattered';
                    return (
                        <View
                            key={p.id}
                            style={[
                                splashStyles.particle,
                                {
                                    width: p.size,
                                    height: p.size,
                                    left: `${isTarget ? p.targetX : p.initialX}%`,
                                    top: `${isTarget ? p.targetY : p.initialY}%`,
                                    opacity: phase === 'forming' ? 0.6 : 0.35,
                                    transform: [{ scale: phase === 'forming' ? 1.1 : 1 }],
                                    backgroundColor: theme.text,
                                },
                            ]}
                        />
                    );
                })}
            </Animated.View>

            <View style={splashStyles.overlay} pointerEvents="none" />
        </TouchableOpacity>
    );
};

const splashStyles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    glowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.2,
    },
    glowCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: '-80%',
        marginTop: '-80%',
        width: '160%',
        height: '160%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 9999,
    },
    logoContainer: {
        position: 'relative',
        zIndex: 30,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -2,
        textTransform: 'uppercase',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    particleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
    },
    particle: {
        position: 'absolute',
        borderRadius: 9999,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundColor: '#000000',
    },
});

// ============================================================================
// ONBOARDING SCREEN
// ============================================================================

interface OnboardingSlide {
    title: string;
    titleHighlight?: string;
    body: string;
    cta: string;
    colors: [string, string, string];
    icons: Array<{
        icon: string;
        bgColor: string;
        label: string;
        value: string;
        position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
        rotation: number;
    }>;
}

export const OnboardingScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [agreed, setAgreed] = useState(false);

    const slides: OnboardingSlide[] = [
        {
            title: 'Welcome to',
            titleHighlight: 'XUM AI',
            body: "Earn by helping train the next generation of AI — using your voice, language, and judgment.",
            cta: "Get Started",
            colors: [theme.primary, theme.success, theme.background],
            icons: [
                { icon: 'mic', bgColor: theme.success, label: 'Voice Labeler', value: '+$0.45/min', position: 'topRight', rotation: 6 },
                { icon: 'verified', bgColor: theme.primary, label: 'RLHF Auditor', value: '+$1.20/task', position: 'bottomLeft', rotation: -3 },
            ],
        },
        {
            title: "Simple Tasks. Real Money.",
            body: "Contribute by recording voice, labeling text or images, validating answers, or judging AI responses.",
            cta: "Next",
            colors: [theme.primaryDark, theme.accent, theme.background],
            icons: [
                { icon: 'edit-note', bgColor: theme.accent, label: 'Text Editor', value: '+$0.15/msg', position: 'topLeft', rotation: -6 },
                { icon: 'image-search', bgColor: theme.primary, label: 'Image Tagger', value: '+$0.80/task', position: 'bottomRight', rotation: 12 },
            ],
        },
        {
            title: "Your Data Trains Smarter AI",
            body: "Your language, culture, and decisions help AI understand the world better — more accurately and fairly.",
            cta: "Next",
            colors: [theme.success, theme.primary, theme.background],
            icons: [
                { icon: 'psychology', bgColor: theme.primaryLight, label: 'Logic Trainer', value: 'Level Up', position: 'topRight', rotation: 12 },
                { icon: 'public', bgColor: theme.success, label: 'Global Impact', value: 'Active', position: 'bottomLeft', rotation: -12 },
            ],
        },
        {
            title: "Fair Pay. Full Control.",
            body: "Track your earnings in real time, withdraw anytime, and work only on tasks you qualify for.",
            cta: "Finish",
            colors: [theme.primary, theme.primaryDark, theme.background],
            icons: [
                { icon: 'payments', bgColor: theme.success, label: 'Instant Pay', value: 'Withdraw', position: 'topLeft', rotation: -12 },
                { icon: 'shield', bgColor: theme.primary, label: 'Privacy Core', value: 'Secured', position: 'bottomRight', rotation: 6 },
            ],
        },
    ];

    const nextStep = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else if (agreed) {
            onNavigate(ScreenName.AUTH);
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const current = slides[step];

    const getIconPosition = (position: string) => {
        switch (position) {
            case 'topLeft': return { top: 8, left: 16 };
            case 'topRight': return { top: 0, right: 0 };
            case 'bottomLeft': return { bottom: 16, left: 0 };
            case 'bottomRight': return { bottom: 32, right: 0 };
            default: return { top: 0, left: 0 };
        }
    };

    return (
        <LinearGradient
            colors={current.colors as any}
            style={[onboardingStyles.container, { backgroundColor: theme.background }]}
        >
            <View style={onboardingStyles.content}>
                {/* Header Navigation */}
                <View style={onboardingStyles.headerContainer}>
                    <View style={onboardingStyles.headerRow}>
                        <TouchableOpacity
                            onPress={prevStep}
                            style={[onboardingStyles.backButton, step === 0 && { opacity: 0 }]}
                        >
                            <MaterialIcons name="arrow-back" size={28} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onNavigate(ScreenName.AUTH)}>
                            <Text style={[onboardingStyles.skipText, { color: theme.textSecondary }]}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress Indicators */}
                    <View style={onboardingStyles.progressRow}>
                        {slides.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    onboardingStyles.progressDot,
                                    i <= step
                                        ? { backgroundColor: theme.text }
                                        : { backgroundColor: `${theme.text}20` },
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Content Area */}
                <View style={onboardingStyles.mainContent}>
                    {/* Floating Icons */}
                    <View style={onboardingStyles.iconsContainer}>
                        {current.icons.map((item, idx) => (
                            <View
                                key={idx}
                                style={[
                                    onboardingStyles.floatingCard,
                                    getIconPosition(item.position),
                                    {
                                        transform: [{ rotate: `${item.rotation}deg` }],
                                        backgroundColor: `${theme.surface}dd`,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <View style={onboardingStyles.floatingCardInner}>
                                    <View style={[onboardingStyles.iconBox, { backgroundColor: `${item.bgColor}20` }]}>
                                        <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={item.bgColor} />
                                    </View>
                                    <View>
                                        <Text style={[onboardingStyles.iconLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                                        <Text style={[onboardingStyles.iconValue, { color: theme.text }]}>{item.value}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Main Text */}
                    <View style={onboardingStyles.textContainer}>
                        <Text style={[onboardingStyles.title, { color: theme.text }]}>
                            {current.title}
                            {current.titleHighlight && (
                                <Text style={[onboardingStyles.titleHighlight, { color: theme.primary }]}> {current.titleHighlight}</Text>
                            )}
                        </Text>
                        <Text style={[onboardingStyles.body, { color: `${theme.text}cc` }]}>{current.body}</Text>
                    </View>

                    {/* Terms Agreement (Last Step Only) */}
                    {step === 3 && (
                        <TouchableOpacity
                            onPress={() => setAgreed(!agreed)}
                            style={[onboardingStyles.termsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        >
                            <View style={[
                                onboardingStyles.checkbox,
                                { borderColor: theme.border },
                                agreed && { backgroundColor: theme.primary, borderColor: theme.primary },
                            ]}>
                                {agreed && <MaterialIcons name="check" size={16} color="white" />}
                            </View>
                            <Text style={[onboardingStyles.termsText, { color: theme.textSecondary }]}>
                                I agree to the Terms and Privacy Policy.
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* CTA Button */}
                    <TouchableOpacity
                        onPress={nextStep}
                        disabled={step === 3 && !agreed}
                        style={[
                            onboardingStyles.ctaButton,
                            { backgroundColor: theme.text },
                            step === 3 && !agreed && { opacity: 0.2 },
                        ]}
                    >
                        <Text style={[onboardingStyles.ctaText, { color: theme.background }]}>{current.cta}</Text>
                        <MaterialIcons name="arrow-forward-ios" size={16} color={theme.background} />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const onboardingStyles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        width: '100%',
    },
    content: {
        flex: 1,
        paddingTop: 48,
    },
    headerContainer: {
        paddingHorizontal: 32,
        zIndex: 30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 32,
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    progressRow: {
        flexDirection: 'row',
        gap: 8,
    },
    progressDot: {
        height: 4,
        flex: 1,
        borderRadius: 9999,
    },
    progressDotActive: {
    },
    progressDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 32,
        paddingBottom: 16,
    },
    iconsContainer: {
        height: 176,
        width: '100%',
        marginBottom: 32,
        position: 'relative',
    },
    floatingCard: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    floatingCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    textContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 52,
        letterSpacing: -1,
    },
    titleHighlight: {
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    body: {
        fontSize: 24,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 16,
        lineHeight: 32,
    },
    termsContainer: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
    },
    termsText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
    },
    ctaButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
});

// ============================================================================
// AUTH SCREEN (Login / Sign Up)
// ============================================================================

export const AuthScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [mode, setMode] = useState<'Login' | 'SignUp'>('Login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        // Simulation delay for premium feel
        setTimeout(() => {
            setLoading(false);
            onNavigate(ScreenName.HOME);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[authStyles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="handled">
                {/* Visual Header Background (Textured Design) */}
                <View style={[authStyles.visualHeader, { backgroundColor: theme.primaryDark }]}>
                    <View style={[authStyles.blob, { backgroundColor: theme.accent, top: -40, right: -40, opacity: 0.6, transform: [{ rotate: '15deg' }] }]} />
                    <View style={[authStyles.blob, { backgroundColor: theme.primary, bottom: -60, left: -60, opacity: 0.4, transform: [{ rotate: '-10deg' }] }]} />
                    <View style={[authStyles.blob, { backgroundColor: theme.success, top: 40, left: -80, opacity: 0.3, width: 220, height: 220 }]} />

                    <SafeAreaView style={authStyles.headerSafeArea}>
                        <TouchableOpacity style={authStyles.miniBackButton} onPress={() => onNavigate(ScreenName.ONBOARDING)}>
                            <MaterialIcons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={authStyles.mainTitle}>
                            {mode === 'Login' ? 'Welcome\nback' : 'Create an\naccount'}
                        </Text>
                    </SafeAreaView>
                </View>

                {/* Main Auth Card */}
                <View style={[authStyles.card, { backgroundColor: theme.surface }]}>
                    {/* Social Login Section */}
                    <TouchableOpacity style={[authStyles.socialButton, { borderColor: theme.border }]} activeOpacity={0.7}>
                        <RNImage
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                            style={authStyles.socialIcon}
                            resizeMode="contain"
                        />
                        <Text style={[authStyles.socialButtonText, { color: theme.text }]}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <View style={authStyles.dividerContainer}>
                        <View style={[authStyles.dividerLine, { backgroundColor: theme.border }]} />
                        <Text style={[authStyles.dividerText, { color: theme.textSecondary }]}>or</Text>
                        <View style={[authStyles.dividerLine, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Email/Password Form */}
                    <View style={authStyles.formFields}>
                        {mode === 'SignUp' && (
                            <View style={authStyles.rowFields}>
                                <TextInput
                                    style={[authStyles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="First Name"
                                    placeholderTextColor={theme.textSecondary}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                                <TextInput
                                    style={[authStyles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Last Name"
                                    placeholderTextColor={theme.textSecondary}
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        )}

                        <TextInput
                            style={[authStyles.inputFull, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Email"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <View style={authStyles.passwordWrapper}>
                            <TextInput
                                style={[authStyles.inputFull, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Password"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={authStyles.eyeIcon}
                            >
                                <MaterialIcons
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {error && <Text style={authStyles.errorTextSmall}>{error}</Text>}

                        <TouchableOpacity
                            style={[authStyles.primaryButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={authStyles.primaryButtonText}>
                                {loading ? 'PLEASE WAIT...' : mode === 'Login' ? 'Login' : 'Create account'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={[authStyles.termsText, { color: theme.textSecondary }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[authStyles.linkText, { color: theme.primary }]}>Privacy Policy</Text> and{' '}
                            <Text style={[authStyles.linkText, { color: theme.primary }]}>Terms of Service</Text>.
                        </Text>

                        <View style={authStyles.footer}>
                            <Text style={[authStyles.footerText, { color: theme.textSecondary }]}>
                                {mode === 'Login' ? "Don't have an account? " : "Have an account? "}
                            </Text>
                            <TouchableOpacity onPress={() => setMode(mode === 'Login' ? 'SignUp' : 'Login')}>
                                <Text style={[authStyles.footerLink, { color: theme.primary }]}>
                                    {mode === 'Login' ? 'Sign up here' : 'Log in here'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const authStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    visualHeader: {
        height: 280,
        position: 'relative',
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    mainTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: 'white',
        lineHeight: 46,
        letterSpacing: -1,
    },
    headerSafeArea: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
    },
    miniBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    card: {
        flex: 1,
        marginTop: -40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 60,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    formFields: {
        gap: 16,
    },
    rowFields: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    inputHalf: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        borderWidth: 1,
    },
    inputFull: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        borderWidth: 1,
        marginBottom: 4,
    },
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
    },
    errorTextSmall: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: -8,
    },
    primaryButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    termsText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 16,
        paddingHorizontal: 8,
    },
    linkText: {
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

// ============================================================================
// FORGOT PASSWORD SCREEN
// ============================================================================

export const ForgotPasswordScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        // Simulation delay
        setTimeout(() => {
            setLoading(false);
            onNavigate(ScreenName.OTP_VERIFICATION);
        }, 1200);
    };

    return (
        <View style={[forgotStyles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[`${theme.primary}33`, 'transparent']}
                style={forgotStyles.headerGradient}
            >
                <View style={forgotStyles.headerContent}>
                    <TouchableOpacity
                        onPress={() => onNavigate(ScreenName.AUTH)}
                        style={[forgotStyles.backButton, { backgroundColor: theme.surface }]}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[forgotStyles.title, { color: theme.text }]}>Access Recovery</Text>
                    <Text style={[forgotStyles.subtitle, { color: theme.textSecondary }]}>Let's get you back to earning</Text>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={forgotStyles.content}>
                <Text style={[forgotStyles.description, { color: `${theme.text}99` }]}>
                    Forgot your password? Enter your email below and we'll send a 4-digit verification code to your terminal.
                </Text>

                <View style={forgotStyles.fieldContainer}>
                    <Text style={[forgotStyles.fieldLabel, { color: theme.textSecondary }]}>Terminal ID (Email)</Text>
                    <View style={forgotStyles.inputContainer}>
                        <MaterialIcons
                            name="alternate-email"
                            size={20}
                            color={theme.textSecondary}
                            style={forgotStyles.inputIcon}
                        />
                        <TextInput
                            style={[forgotStyles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                            placeholder="name@domain.com"
                            placeholderTextColor={`${theme.text}44`}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[forgotStyles.submitButton, { backgroundColor: theme.text }]}
                >
                    <Text style={[forgotStyles.submitButtonText, { color: theme.background }]}>
                        {loading ? 'Sending...' : 'Request Reset Code'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const forgotStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        height: 192,
        position: 'relative',
    },
    headerContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 32,
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 22,
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    fieldLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        height: 64,
        paddingLeft: 48,
        paddingRight: 16,
        fontWeight: '500',
        fontSize: 16,
    },
    submitButton: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    submitButtonText: {
        color: '#000000',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

// ============================================================================
// OTP VERIFICATION SCREEN
// ============================================================================

export const OTPScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [countdown, setCountdown] = useState(59);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (val: string, index: number) => {
        if (!/^\d*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);

        if (val && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length !== 4) {
            alert('Please enter the complete 4-digit code');
            return;
        }

        // Simulation delay for consistency
        setTimeout(() => {
            onNavigate(ScreenName.HOME);
        }, 1000);
    };

    const handleResend = () => {
        if (countdown > 0) return;
        setCountdown(59);
        // TODO: Resend OTP
        alert('New code sent!');
    };

    return (
        <View style={[otpStyles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[`${theme.primary}33`, 'transparent']}
                style={otpStyles.headerGradient}
            >
                <View style={otpStyles.headerContent}>
                    <TouchableOpacity
                        onPress={() => onNavigate(ScreenName.FORGOT_PASSWORD)}
                        style={[otpStyles.backButton, { backgroundColor: theme.surface }]}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[otpStyles.title, { color: theme.text }]}>Verify Identity</Text>
                    <Text style={[otpStyles.subtitle, { color: theme.textSecondary }]}>Enter the validation sequence</Text>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={otpStyles.content}>
                <Text style={[otpStyles.description, { color: `${theme.text}99` }]}>
                    Enter the 4-digit code we just sent to your inbox.
                </Text>

                {/* OTP Inputs */}
                <View style={otpStyles.otpRow}>
                    {otp.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={(ref: TextInput | null) => { inputRefs.current[i] = ref; }}
                            style={[otpStyles.otpInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.primary }]}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(val: string) => handleChange(val, i)}
                            onKeyPress={({ nativeEvent }: any) => handleKeyPress(nativeEvent.key, i)}
                        />
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={otpStyles.actionsContainer}>
                    <TouchableOpacity
                        onPress={handleVerify}
                        style={[otpStyles.verifyButton, { backgroundColor: theme.text }]}
                    >
                        <Text style={[otpStyles.verifyButtonText, { color: theme.background }]}>Verify & Access</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={countdown > 0}
                        style={otpStyles.resendButton}
                    >
                        <Text style={[
                            otpStyles.resendText,
                            { color: theme.text },
                            countdown > 0 && { color: theme.textSecondary },
                        ]}>
                            {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const otpStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        height: 192,
        position: 'relative',
    },
    headerContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 32,
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    description: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 22,
        marginBottom: 32,
        textAlign: 'center',
    },
    otpRow: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
        marginBottom: 40,
    },
    otpInput: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        textAlign: 'center',
        fontSize: 28,
        fontWeight: '900',
    },
    actionsContainer: {
        width: '100%',
        gap: 16,
    },
    verifyButton: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    verifyButtonText: {
        color: '#000000',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resendButton: {
        width: '100%',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
