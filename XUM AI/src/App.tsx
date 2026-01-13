/**
 * XUM AI - Main Application Entry Point
 * 
 * This is a hybrid React Native / React Native Web application that serves as
 * the contributor interface for the XUM AI data labeling platform.
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactNative from 'react-native';
const {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
  Animated,
  ImageBackground,
} = ReactNative;
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { supabase } from './supabaseClient';
import { ScreenName } from './types';

// Import Auth Screens (Pure React Native - APK compatible)
import {
  SplashScreen as AuthSplashScreen,
  OnboardingScreen as AuthOnboardingScreen,
  AuthScreen,
  ForgotPasswordScreen,
  OTPScreen,
} from './screens/AuthScreensNative';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { XumJudgeScreen } from './screens/XumJudgeScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { WalletScreen } from './screens/WalletScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SupportScreen } from './screens/SupportScreen';
import { VoiceTaskScreen } from './screens/tasks/VoiceTaskScreen';
import { ImageTaskScreen } from './screens/tasks/ImageTaskScreen';
import { VideoTaskScreen } from './screens/tasks/VideoTaskScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { TaskService, Transaction } from './services/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clerk Authentication
import { ClerkProvider, useUser, useAuth, useClerk, SignedIn, SignedOut } from './context/ClerkProvider';

import {
  ThemeContext,
  ThemeId,
  ThemeColors,
  themePresets,
  useTheme,
  ThemeContextType,
} from './context/ThemeContext';

// Legacy support - will be replaced by context
let colors: ThemeColors = themePresets.solar;

// ============================================================================
// TYPES
// ============================================================================

// ScreenName is imported from types.ts
// Transaction type imported from TaskService

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const XumJudgeItems = ({ onNavigate, userId }: { onNavigate: (s: ScreenName) => void; userId: string }) => {
  const { theme } = useTheme();
  const [judgeTasks, setJudgeTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const loadTasks = async () => {
      const data = await TaskService.getXumJudgeTasks(userId);
      setJudgeTasks(data.slice(0, 2)); // Show only 2 on home
    };
    loadTasks();
  }, [userId]);

  return (
    <>
      {judgeTasks.map((task) => (
        <TouchableOpacity key={task.id} onPress={() => onNavigate(ScreenName.XUM_JUDGE)} style={[styles.judgeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.judgeIconBox, { backgroundColor: `${task.icon_color}15` }]}>
            <MaterialIcons name={task.icon_name} size={22} color={task.icon_color} />
          </View>
          <View style={styles.judgeInfo}>
            <Text style={[styles.judgeTitle, { color: theme.text }]}>{task.title}</Text>
            <Text style={[styles.judgeSubtitle, { color: theme.textSecondary }]}>{task.subtitle}</Text>
          </View>
          <View style={styles.judgeReward}>
            <Text style={[styles.judgeRewardValue, { color: theme.success }]}>${(task.reward || 0).toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

// ============================================================================
// SPLASH SCREEN
// ============================================================================

const SplashScreen = ({ onNavigate }: { onNavigate: (s: ScreenName) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onNavigate(ScreenName.ONBOARDING), 3000);
    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <View style={styles.splashContainer}>
      <LinearGradient
        colors={['#0a0d1d', '#1349ec11', '#0a0d1d']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.splashLogoContainer}>
        <View style={styles.splashLogoGlow} />
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 100, height: 100, resizeMode: 'contain' }}
        />
      </View>
      <Text style={styles.splashTitle}>XUM AI</Text>
      <View style={styles.splashLine} />
      <Text style={styles.splashSubtitle}>REDEFINING NEURAL INTERFACE</Text>
      <View style={styles.splashFooter}>
        <Text style={styles.splashFooterText}>SECURE CONNECTED ACTIVE</Text>
      </View>
    </View>
  );
};

// ============================================================================
// ONBOARDING SCREEN
// ============================================================================

const OnboardingScreen = ({ onNavigate }: { onNavigate: (s: ScreenName) => void }) => {
  const slides = [
    {
      title: 'Neural Training',
      desc: 'Earn by providing environmental data for advanced AI models.',
      icon: 'sensors',
    },
    {
      title: 'Linguistic Audit',
      desc: 'Verify and ground machine translations in local dialects.',
      icon: 'translate',
    },
    {
      title: 'Global Network',
      desc: 'Access decentralized tasks from anywhere in the world.',
      icon: 'public',
    },
  ];

  const [step, setStep] = useState(0);

  const handleSkip = () => {
    onNavigate(ScreenName.HOME);
  };

  return (
    <View style={styles.onboardingContainer}>
      <LinearGradient
        colors={['#0a0d1d', '#1349ec22']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.flex1}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingLogo}>XUM AI</Text>
          <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.stepIndicator}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i === step && styles.stepDotActive
                ]}
              />
            ))}
          </View>

          <View style={styles.slideCard}>
            <View style={styles.slideIconBg}>
              <MaterialIcons name={slides[step].icon as any} size={48} color="#fff" />
            </View>
            <Text style={styles.slideTitle}>{slides[step].title}</Text>
            <Text style={styles.slideDesc}>{slides[step].desc}</Text>
          </View>
        </View>

        <View style={styles.onboardingFooter}>
          <TouchableOpacity
            style={styles.onboardingButton}
            onPress={() => {
              if (step < slides.length - 1) {
                setStep(step + 1);
              } else {
                onNavigate(ScreenName.HOME);
              }
            }}
          >
            <Text style={styles.onboardingButtonText}>
              {step === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// HOME SCREEN
// ============================================================================

interface HomeProps {
  onNavigate: (s: ScreenName) => void;
  balance: number;
  onOpenNeuralInput: () => void;
  onOpenContributorHub: () => void;
  session: any;
}

const HomeScreen = ({
  onNavigate,
  balance,
  onOpenNeuralInput,
  onOpenContributorHub,
  session,
}: HomeProps) => {
  const { theme } = useTheme();

  const [featuredTasks, setFeaturedTasks] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load Home Data
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      const [fTasks, dMissions, uStats] = await Promise.all([
        TaskService.getFeaturedTasks(),
        TaskService.getDailyMissions(session.user.id),
        TaskService.getUserTaskStats(session.user.id)
      ]);
      setFeaturedTasks(fTasks);
      setMissions(dMissions);
      setStats(uStats);
    };

    loadData();
  }, [session?.user?.id, balance]); // Reload on balance change too for freshness

  // Calculate user's 24h rank (mock logic for now, could be real if backend supports)
  const userRank = 142;
  const user24hEarned = stats?.totalEarned || 0;

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.homeHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={styles.welcomeText}>WELCOME BACK,</Text>
            <Text style={[styles.agentText, { color: '#fff', fontSize: 13, fontWeight: '600' }]}>
              {(session?.user?.fullName || session?.user?.firstName || session?.user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'CONTRIBUTOR').toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onNavigate(ScreenName.PROFILE)}
            activeOpacity={0.7}
            style={{ position: 'relative' }}
          >
            {session?.user?.imageUrl ? (
              <Image
                source={{ uri: session.user.imageUrl }}
                style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: theme.primary }}
              />
            ) : (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                borderWidth: 3,
                borderColor: theme.primary,
                backgroundColor: `${theme.primary}20`,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <MaterialIcons name="person" size={36} color={theme.primary} />
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: theme.success,
              borderWidth: 3,
              borderColor: theme.background
            }} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards - Clean minimal design */}
        <View style={styles.statsRow}>
          <TouchableOpacity onPress={() => onNavigate(ScreenName.WALLET)} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { marginBottom: 8 }]}>BALANCE</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>${(balance || 0).toFixed(2)}</Text>
            <Text style={styles.statSubtext}>USD BALANCE</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { marginBottom: 8 }]}>IN REVIEW</Text>
            <Text style={[styles.statValue, { color: theme.warning }]}>{stats?.pendingReview || 0}</Text>
            <Text style={styles.statSubtext}>TASKS</Text>
          </View>
        </View>

        {/* Leaderboard Card - Redesigned with 24hr earnings logic */}
        {/* Leaderboard Card - Redesigned "Nanobanana" Perspective */}
        <TouchableOpacity onPress={() => onNavigate(ScreenName.LEADERBOARD)}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop' }}
            style={[styles.networkCard, { padding: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }]}
            imageStyle={{ opacity: 0.4 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
              style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
            />

            {/* Main Content */}
            <View style={{ padding: 24, zIndex: 2, flex: 1, justifyContent: 'space-between' }}>
              <View>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>
                    WEEKLY RANKING
                  </Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '300', letterSpacing: -0.5, opacity: 0.9 }}>GLOBAL</Text>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 0.5, lineHeight: 32 }}>LEADERBOARD</Text>
              </View>
            </View>

            {/* Top Right - Avatars (Replaces Rank) */}
            <View style={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}>
              <View style={[styles.avatarRow, { transform: [{ scale: 0.9 }], marginRight: -10 }]}>
                {session?.user?.imageUrl ? (
                  <Image
                    source={{ uri: session.user.imageUrl }}
                    style={[styles.avatarCircle, { marginLeft: 0, borderWidth: 2, borderColor: '#fff' }]}
                  />
                ) : (
                  <View style={[styles.avatarCircle, { marginLeft: 0 }]}>
                    <Text style={styles.avatarText}>{session?.user?.email?.[0].toUpperCase() || 'A'}</Text>
                  </View>
                )}
                <View style={[styles.avatarCircle, { marginLeft: -12, backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={styles.avatarText}>M</Text>
                </View>
                <View style={[styles.avatarCircle, { marginLeft: -12, backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.avatarTextSmall}>+300</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* XUM Judge Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>XUM JUDGE</Text>
          <TouchableOpacity onPress={() => onNavigate(ScreenName.XUM_JUDGE)}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>VIEW MORE</Text>
          </TouchableOpacity>
        </View>
        <XumJudgeItems onNavigate={onNavigate} userId={session?.user?.id} />

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FEATURED</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
        >
          {featuredTasks.length > 0 ? (
            featuredTasks.map((task) => (
              <TouchableOpacity key={task.id} onPress={() => onNavigate(task.target_screen)} activeOpacity={0.9} style={{ marginRight: 16 }}>
                <LinearGradient
                  colors={[task.gradient_start, task.gradient_end]}
                  style={styles.featuredPromoCardSmall}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featuredPromoContent}>
                    <View style={styles.featuredPromoBadge}>
                      <Text style={styles.featuredPromoBadgeText}>{task.badge_text}</Text>
                    </View>
                    <Text style={styles.featuredPromoTitleSmall}>{task.title}</Text>
                    <Text style={styles.featuredPromoSubtitleSmall}>{task.subtitle}</Text>
                  </View>
                  <View style={styles.featuredPromoIconBgRight}>
                    <MaterialIcons name={task.icon_name} size={70} color="rgba(255,255,255,0.2)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <LinearGradient colors={['#333', '#222']} style={styles.featuredPromoCardSmall}>
              <View style={styles.featuredPromoContent}>
                <Text style={{ color: '#888' }}>Loading promos...</Text>
              </View>
            </LinearGradient>
          )}
        </ScrollView>


        {/* Daily Missions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DAILY MISSIONS</Text>
          <TouchableOpacity onPress={() => onNavigate(ScreenName.TASK_MARKETPLACE)}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>BROWSE ALL</Text>
          </TouchableOpacity>
        </View>
        {missions.map((mission) => (
          <TouchableOpacity key={mission.id} onPress={() => onNavigate(mission.target_screen)} style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.missionIconBox, { backgroundColor: `${mission.icon_color}15` }]}>
              <MaterialIcons name={mission.icon_name} size={22} color={mission.icon_color} />
            </View>
            <View style={styles.missionInfo}>
              <Text style={[styles.missionTitle, { color: theme.text }]}>{mission.title}</Text>
              <View style={styles.missionMeta}>
                <Text style={[styles.missionTime, { color: theme.textSecondary }]}>⏱ {mission.estimated_time}</Text>
              </View>
            </View>
            <Text style={[styles.missionReward, { color: theme.success }]}>${(mission.reward || 0).toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavigation
        activeScreen={ScreenName.HOME}
        onNavigate={onNavigate}
        onOpenNeuralInput={onOpenNeuralInput}
        onOpenContributorHub={onOpenContributorHub}
      />
    </View>
  );
};

// ============================================================================
// ENVIRONMENTAL SENSING SCREEN
// ============================================================================

const EnvironmentalSensingScreen = ({ onNavigate }: { onNavigate: (s: ScreenName) => void }) => {
  const { theme } = useTheme();

  const captureOptions = [
    {
      title: 'Record Voice',
      subtitle: 'Speak prompts to help AI understand speech',
      description: 'Complete 5 voice recordings to earn rewards',
      icon: 'mic',
      color: '#1349ec',
      reward: '$0.25 per task',
      screen: 'VOICE_TASK' as ScreenName
    },
    {
      title: 'Take Photos',
      subtitle: 'Capture images of objects and scenes',
      description: 'Complete 5 photo tasks to earn rewards',
      icon: 'camera-alt',
      color: '#10b981',
      reward: '$0.30 per task',
      screen: 'IMAGE_TASK' as ScreenName
    },
    {
      title: 'Record Video',
      subtitle: 'Film short clips for motion training',
      description: 'Complete 5 video recordings to earn rewards',
      icon: 'videocam',
      color: '#f43f5e',
      reward: '$0.50 per task',
      screen: 'VIDEO_TASK' as ScreenName
    },
  ];

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>CAPTURE DATA</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[captureStyles.heroTitle, { color: theme.text }]}>Earn Money{'\n'}With Your Phone</Text>
          <Text style={[captureStyles.heroSubtitle, { color: theme.textSecondary }]}>
            Use your camera and microphone to help train AI. Complete tasks, get paid instantly.
          </Text>
        </View>

        {/* How It Works */}
        <View style={[captureStyles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MaterialIcons name="info-outline" size={20} color={theme.primary} />
          <Text style={[captureStyles.infoText, { color: theme.textSecondary }]}>
            Complete 5 tasks in a row to unlock your reward. Add English translations for bonus credits!
          </Text>
        </View>

        {/* Capture Options */}
        {captureOptions.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[captureStyles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onNavigate(opt.screen)}
            activeOpacity={0.8}
          >
            <View style={[captureStyles.optionIconBox, { backgroundColor: opt.color }]}>
              <MaterialIcons name={opt.icon as any} size={28} color="#fff" />
            </View>
            <View style={captureStyles.optionInfo}>
              <Text style={[captureStyles.optionTitle, { color: theme.text }]}>{opt.title}</Text>
              <Text style={[captureStyles.optionSubtitle, { color: theme.textSecondary }]}>{opt.subtitle}</Text>
              <Text style={[captureStyles.optionReward, { color: theme.success }]}>{opt.reward}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


// ============================================================================
// LINGUASENSE ENGINE SCREEN
// ============================================================================

const LinguaSenseEngineScreen = ({ onNavigate }: { onNavigate: (s: ScreenName) => void }) => {
  const infraItems = [
    { title: 'GROUNDING (H2D)', subtitle: 'Convert human dialects into machine intelligence.', icon: 'psychology', tasks: 42, color: '#1349ec' },
    { title: 'SYNTHESIS (D2H)', subtitle: 'Test AI comprehension of complex cultural cues.', icon: 'auto-awesome', tasks: 18, color: '#4338ca' },
    { title: 'AUDIT LAYER', subtitle: 'Identify and correct hallucinations in LLM outputs.', icon: 'security', tasks: 31, color: '#10b981' },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LINGUASENSE ENGINE</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#1e2330', '#1349ec44']} style={modalStyles.linguaHero}>
          <View style={modalStyles.linguaHeroHeader}>
            <View style={modalStyles.activeDot} />
            <Text style={modalStyles.heroStatus}>SYSTEM ACTIVE</Text>
          </View>
          <Text style={modalStyles.heroTitle}>Language{'\n'}Lab</Text>
          <Text style={modalStyles.heroSubtitle}>Help AI understand human culture and dialects through simple tasks.</Text>
          <View style={modalStyles.heroStats}>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>GLOBAL NODES</Text>
              <Text style={modalStyles.statValue}>114</Text>
            </View>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>ACCURACY</Text>
              <Text style={modalStyles.statValue}>99.8%</Text>
            </View>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>CONTRIBUTORS</Text>
              <Text style={modalStyles.statValue}>2.4M</Text>
            </View>
          </View>
          <View style={modalStyles.heroIcon}>
            <MaterialIcons name="hub" size={100} color="rgba(19, 73, 236, 0.2)" />
          </View>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>AVAILABLE TASKS</Text>
        {infraItems.map((item, i) => (
          <TouchableOpacity key={i} style={modalStyles.infraCard} onPress={() => onNavigate(ScreenName.TASK_MARKETPLACE)}>
            <View style={modalStyles.infraIconBox}>
              <MaterialIcons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={modalStyles.infraInfo}>
              <View style={modalStyles.infraHeader}>
                <Text style={modalStyles.infraTitle}>{item.title}</Text>
                <Text style={[modalStyles.infraTasks, { color: item.color }]}>{item.tasks} TASKS</Text>
              </View>
              <Text style={modalStyles.infraSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={modalStyles.footerInfo}>
          <Text style={modalStyles.footerText}>SECURE CONNECTION</Text>
          <Text style={modalStyles.footerText}>STATUS: ONLINE</Text>
        </View>
      </ScrollView>
    </View>
  );
};
// PROFILE SCREEN MOVED TO EXTERNAL FILE


// ============================================================================
// APPEARANCE LABS SCREEN
// ============================================================================

interface AppearanceLabsProps {
  onNavigate: (s: ScreenName) => void;
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

const AppearanceLabsScreen = ({ onNavigate, currentTheme, onThemeChange }: AppearanceLabsProps) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const gap = 12;
  const columnCount = screenWidth > 600 ? 4 : 3;
  const cardWidth = (screenWidth - (padding * 2) - (gap * (columnCount - 1))) / columnCount;

  // Check if currently in dark mode (any theme except 'light')
  const isDarkMode = currentTheme !== 'light';

  const themes: { id: ThemeId; name: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', color: '#1349ec' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'solar', name: 'Solar', color: '#f59e0b' },
    { id: 'amoled', name: 'AMOLED', color: '#818cf8' },
    { id: 'night', name: 'Night', color: '#8b5cf6' },
    { id: 'crimson', name: 'Crimson', color: '#f43f5e' },
  ];

  const handleThemeSelect = (themeId: ThemeId) => {
    onThemeChange(themeId);
  };

  const handleDarkModeToggle = () => {
    if (isDarkMode) {
      // Switch to light mode
      onThemeChange('light');
    } else {
      // Switch to default dark mode (midnight)
      onThemeChange('midnight');
    }
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>APPEARANCE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        {/* Dark Mode Toggle Card */}
        <TouchableOpacity
          style={[themeStyles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleDarkModeToggle}
          activeOpacity={0.7}
        >
          <View style={themeStyles.modeInfo}>
            <View style={[themeStyles.modeIconBox, { backgroundColor: `${theme.primary}20` }]}>
              <MaterialIcons name={isDarkMode ? "dark-mode" : "light-mode"} size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[themeStyles.modeTitle, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[themeStyles.modeSubtitle, { color: theme.textSecondary }]}>
                {isDarkMode ? 'On' : 'Off'} • Tap to toggle
              </Text>
            </View>
          </View>
          <View style={themeStyles.toggleContainer}>
            <View style={[themeStyles.toggleTrack, { backgroundColor: isDarkMode ? theme.primary : 'rgba(255,255,255,0.2)' }]}>
              <View style={[themeStyles.toggleThumb, { marginLeft: isDarkMode ? 20 : 2 }]} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { marginBottom: 20, marginTop: 24, color: theme.text }]}>CHOOSE THEME</Text>

        {/* Theme Grid - Only show dark themes when in dark mode */}
        {isDarkMode ? (
          <View style={themeStyles.grid}>
            {themes.map((t) => {
              const isActive = currentTheme === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    themeStyles.themeCard,
                    {
                      width: cardWidth,
                      backgroundColor: theme.surface,
                      borderColor: isActive ? t.color : 'transparent',
                    },
                    isActive && { backgroundColor: `${t.color}08` }
                  ]}
                  onPress={() => handleThemeSelect(t.id)}
                  activeOpacity={0.8}
                >
                  <View style={[themeStyles.themeColor, { backgroundColor: t.color }]} />
                  <Text style={[themeStyles.themeName, { color: theme.text }]}>{t.name}</Text>
                  <View style={[
                    themeStyles.themeBadge,
                    isActive && { backgroundColor: t.color }
                  ]}>
                    <Text style={[
                      themeStyles.themeBadgeText,
                      isActive && themeStyles.themeBadgeTextActive
                    ]}>
                      {isActive ? 'ACTIVE' : 'SELECT'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={[captureStyles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialIcons name="light-mode" size={24} color={theme.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>Light Mode Active</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                Enable Dark Mode to access theme options
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// CONTRIBUTOR HUB MODAL
// ============================================================================

interface ContributorHubModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (s: ScreenName) => void;
  currentTheme: ThemeId;
  onLogout?: () => void;
}

const ContributorHubModal = ({ visible, onClose, onNavigate, currentTheme, onLogout }: ContributorHubModalProps) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setExpanded(false);
      expandAnim.setValue(0);
    }
  }, [visible]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 20 && !expanded) {
      setExpanded(true);
      Animated.spring(expandAnim, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
      }).start();
    }
  };

  const modalHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.55, screenHeight * 0.92],
  });

  const menuItems = [
    { label: 'PROFILE', icon: 'person', color: '#3b82f6', screen: ScreenName.PROFILE },
    { label: 'WALLET', icon: 'account-balance-wallet', color: theme.success, screen: ScreenName.WALLET },
    { label: 'NOTIFICATIONS', icon: 'notifications', color: theme.warning },
    { label: 'RANKING', icon: 'military-tech', color: '#a855f7', screen: ScreenName.LEADERBOARD },
    { label: 'THEME', icon: 'palette', color: '#ec4899', subtitle: `${currentTheme.toUpperCase()} MODE`, screen: ScreenName.APPEARANCE_LABS },
    { label: 'SETTINGS', icon: 'settings', color: '#64748b', screen: ScreenName.SETTINGS },
    { label: 'SUPPORT', icon: 'help-center', color: '#06b6d4', screen: ScreenName.SUPPORT },
  ];

  const screenWidth = Dimensions.get('window').width;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={hubStyles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[hubStyles.container, { height: modalHeight, backgroundColor: theme.background, maxHeight: screenHeight }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => { }} style={{ flex: 1 }}>
            <View style={hubStyles.dragHandle} />
            <View style={hubStyles.header}>
              <Text style={hubStyles.title}>MENU</Text>
              <TouchableOpacity onPress={onClose} style={hubStyles.closeButton}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              <View style={hubStyles.list}>
                {menuItems.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[hubStyles.listItem, { backgroundColor: theme.surface }]}
                    onPress={() => { onClose(); item.screen && onNavigate(item.screen); }}
                  >
                    <View style={[hubStyles.listIconBox, { backgroundColor: `${item.color}15` }]}>
                      <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View style={hubStyles.listContent}>
                      <Text style={hubStyles.listLabel}>{item.label}</Text>
                      {item.subtitle && <Text style={[hubStyles.listSubtitle, { color: item.color }]}>{item.subtitle}</Text>}
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={hubStyles.logoutButton} onPress={() => { onClose(); onLogout && onLogout(); }}>
                <MaterialIcons name="logout" size={20} color={theme.error} />
                <Text style={[hubStyles.logoutText, { color: theme.error }]}>LOG OUT</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// NEURAL INPUT MODAL - Redesigned with better UX
// ============================================================================

const NeuralInputModal = ({
  visible,
  onClose,
  onNavigate,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (s: ScreenName) => void;
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[modalStyles.container, { paddingBottom: 80 }]}>
          <View style={modalStyles.dragHandle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>CREATE TASK</Text>
            <Text style={modalStyles.subtitle}>Choose your input method</Text>
          </View>

          <View style={modalStyles.content}>
            <TouchableOpacity
              style={modalStyles.cardWrapper}
              onPress={() => { onClose(); onNavigate(ScreenName.ENVIRONMENTAL_SENSING); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#10b981', '#059669']} style={modalStyles.inputCard}>
                <View style={modalStyles.cardContent}>
                  <View style={modalStyles.iconCircle}>
                    <MaterialIcons name="photo-camera" size={28} color="#fff" />
                  </View>
                  <View style={modalStyles.cardTextContainer}>
                    <Text style={modalStyles.cardTitle}>Capture Data</Text>
                    <Text style={modalStyles.cardSubtitle}>Photos, videos, and voice recordings</Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.cardWrapper}
              onPress={() => { onClose(); onNavigate(ScreenName.LINGUASENSE_ENGINE); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#8b5cf6', '#6366f1']} style={modalStyles.inputCard}>
                <View style={modalStyles.cardContent}>
                  <View style={modalStyles.iconCircle}>
                    <MaterialIcons name="translate" size={28} color="#fff" />
                  </View>
                  <View style={modalStyles.cardTextContainer}>
                    <Text style={modalStyles.cardTitle}>XUM LinguaSense</Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};


// ============================================================================
// WALLET SCREEN (REDESIGN PER IMAGE 4)
// ============================================================================

// WalletScreen moved to external file

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

const BottomNavigation = ({
  activeScreen,
  onNavigate,
  onOpenNeuralInput,
  onOpenContributorHub,
}: {
  activeScreen: ScreenName;
  onNavigate: (s: ScreenName) => void;
  onOpenNeuralInput: () => void;
  onOpenContributorHub: () => void;
}) => {
  const { theme } = useTheme();

  const navItems: { label: string; icon: string; screen?: ScreenName; action?: () => void }[] = [
    { label: 'HOME', icon: 'home', screen: ScreenName.HOME },
    { label: 'TASK', icon: 'explore', screen: ScreenName.TASK_MARKETPLACE },
    { label: 'ADD', icon: 'add', action: onOpenNeuralInput },
    { label: 'WALLET', icon: 'account-balance-wallet', screen: ScreenName.WALLET },
    { label: 'MENU', icon: 'menu', action: onOpenContributorHub },
  ];

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {navItems.map((item, i) => {
        if (item.label === 'ADD') {
          return (
            <TouchableOpacity key={i} onPress={item.action} style={[styles.centerButton, { backgroundColor: theme.primary }]}>
              <MaterialIcons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          );
        }
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => item.action ? item.action() : item.screen && onNavigate(item.screen)}
            style={styles.navItem}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? theme.primary : theme.textSecondary}
            />
            <Text style={[styles.navLabel, isActive && { color: theme.primary }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ============================================================================
// SETTINGS SCREEN - Redesigned with user-friendly language
// ============================================================================

const SettingsScreen = ({ onNavigate, onLogout, onBack }: { onNavigate: (s: ScreenName) => void; onLogout?: () => void; onBack?: () => void }) => {
  const { theme } = useTheme();

  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Profile', icon: 'person', value: 'Demo User', screen: ScreenName.PROFILE },
        { label: 'Security', icon: 'shield', value: 'Verified' },
        { label: 'Payment Methods', icon: 'credit-card', value: '2 cards' },
      ],
    },
    {
      title: 'APP SETTINGS',
      items: [
        { label: 'Appearance', icon: 'palette', value: 'Dark', screen: ScreenName.APPEARANCE_LABS },
        { label: 'Notifications', icon: 'notifications', value: 'On' },
        { label: 'Language', icon: 'language', value: 'English' },
        { label: 'Data & Storage', icon: 'storage', value: '14.2 MB' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help Center', icon: 'help', value: '', screen: ScreenName.SUPPORT },
        { label: 'Report a Problem', icon: 'flag', value: '' },
        { label: 'Privacy Policy', icon: 'policy', value: '' },
        { label: 'Terms of Service', icon: 'description', value: '' },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        { label: 'App Version', icon: 'info', value: '1.0.0' },
        { label: 'Rate the App', icon: 'star', value: '' },
      ],
    },
  ];

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack ? onBack() : onNavigate(ScreenName.HOME)}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        {sections.map((section, idx) => (
          <View key={idx} style={settingsStyles.section}>
            <Text style={settingsStyles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[settingsStyles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => item.screen && onNavigate(item.screen)}
              >
                <View style={settingsStyles.itemLeft}>
                  <View style={[settingsStyles.iconBox, { backgroundColor: `${theme.primary}15` }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={theme.primary} />
                  </View>
                  <Text style={settingsStyles.itemLabel}>{item.label}</Text>
                </View>
                <View style={settingsStyles.itemRight}>
                  {item.value && <Text style={settingsStyles.itemValue}>{item.value}</Text>}
                  <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[settingsStyles.logoutButton, { borderColor: theme.error }]} onPress={onLogout}>
          <MaterialIcons name="logout" size={20} color={theme.error} />
          <Text style={[settingsStyles.logoutText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>

        <Text style={settingsStyles.footerText}>XUM AI v1.0.0 • Made with ❤️</Text>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// TASK MARKETPLACE SCREEN
// ============================================================================

interface TaskMarketplaceProps {
  onNavigate: (s: ScreenName) => void;
  onOpenContributorHub: () => void;
  onOpenNeuralInput: () => void;
  session: any;
  onBack?: () => void;
}

const TaskMarketplaceScreen = ({ onNavigate, onOpenContributorHub, onOpenNeuralInput, session, onBack }: TaskMarketplaceProps) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [featuredTasks, setFeaturedTasks] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filters = ['ALL', 'AUDIO', 'TEXT', 'IMAGE'];

  useEffect(() => {
    const loadTasks = async () => {
      if (!session?.user?.id) return;
      setIsLoading(true);
      try {
        const [f, m] = await Promise.all([
          TaskService.getFeaturedTasks(),
          TaskService.getDailyMissions(session.user.id)
        ]);
        setFeaturedTasks(f);
        setMissions(m);
      } catch (err) {
        console.error("Error loading marketplace tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [session?.user?.id]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => onBack ? onBack() : onNavigate(ScreenName.HOME)}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>TASK</Text>
        <TouchableOpacity>
          <MaterialIcons name="refresh" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Search Bar with Filter Icon */}
        <View style={[taskStyles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[taskStyles.searchInput, { color: theme.text }]}
            placeholder="Search"
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity onPress={() => setIsFilterVisible(true)} style={{ padding: 4 }}>
            <MaterialIcons name="tune" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Modal */}
        <Modal visible={isFilterVisible} transparent animationType="fade" onRequestClose={() => setIsFilterVisible(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => setIsFilterVisible(false)}
          >
            <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 24, width: '80%', gap: 12 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>FILTER BY TYPE</Text>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    taskStyles.filterPill,
                    { width: '100%', marginBottom: 12, backgroundColor: activeFilter === filter ? theme.primary : 'rgba(255,255,255,0.05)' }
                  ]}
                  onPress={() => { setActiveFilter(filter); setIsFilterVisible(false); }}
                >
                  <Text style={[taskStyles.filterText, { color: activeFilter === filter ? '#fff' : theme.textSecondary }]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Laboratory Card */}
        <View style={taskStyles.labCard}>
          <LinearGradient colors={[theme.surface, theme.background]} style={[taskStyles.labGradient, { borderColor: theme.border, borderWidth: 1, borderRadius: 24 }]}>
            <View style={[taskStyles.labBadge, { backgroundColor: `${theme.primary}20` }]}>
              <Text style={[taskStyles.labBadgeText, { color: theme.primary }]}>LABORATORY</Text>
            </View>
            <Text style={[taskStyles.labTitle, { color: theme.text }]}>TRAIN YOUR{'\n'}OWN AI</Text>
            <Text style={[taskStyles.labSubtitle, { color: theme.textSecondary }]}>Personalize models with your data and preferences.</Text>
            <TouchableOpacity style={taskStyles.labButton} onPress={() => onNavigate(ScreenName.ENVIRONMENTAL_SENSING)}>
              <Text style={[taskStyles.labButtonText, { color: theme.primary }]}>OPEN NEURAL LAB</Text>
              <MaterialIcons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
            <View style={taskStyles.labIcon}>
              <MaterialIcons name="psychology" size={80} color={`${theme.primary}25`} />
            </View>
          </LinearGradient>
        </View>

        {/* Featured Tasks */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 24, color: theme.text }]}>FEATURED TASKS</Text>
        {isLoading && featuredTasks.length === 0 ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[taskStyles.featuredRow, { paddingLeft: 16, paddingRight: 32 }]}
          >
            {featuredTasks.map((task) => (
              <TouchableOpacity key={task.id} onPress={() => onNavigate(ScreenName.TASK_DETAILS)} style={{ marginRight: 16 }}>
                <LinearGradient colors={[task.gradient_start || theme.primary, task.gradient_end || theme.primaryDark]} style={taskStyles.featuredCard}>
                  <View style={taskStyles.featuredBadge}>
                    <Text style={taskStyles.featuredBadgeText}>PRIORITY CONTRACT</Text>
                  </View>
                  <Text style={taskStyles.featuredTitle}>{task.title}</Text>
                  <Text style={taskStyles.featuredSubtitle}>{task.subtitle}</Text>
                  <View style={taskStyles.featuredFooter}>
                    <Text style={taskStyles.featuredTime}>⏱ {task.time}</Text>
                    <Text style={taskStyles.featuredReward}>${(task.reward || 0).toFixed(2)}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Available Missions */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 24, marginBottom: 16, color: theme.text }]}>
          AVAILABLE MISSIONS
        </Text>
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {isLoading && missions.length === 0 ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
          ) : missions.length > 0 ? (
            missions.map((mission) => (
              <TouchableOpacity key={mission.id} onPress={() => onNavigate(mission.target_screen || ScreenName.TASK_DETAILS)} style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: mission.is_locked_for_new_users ? 0.6 : 1 }]} disabled={mission.is_locked_for_new_users}>
                <View style={[styles.missionIconBox, { backgroundColor: `${mission.icon_color || theme.primary}20` }]}>
                  <MaterialIcons name={(mission.icon_name || 'assignment') as any} size={18} color={mission.icon_color || theme.primary} />
                </View>
                <View style={styles.missionInfo}>
                  <Text style={[styles.missionTitle, { color: theme.text }]}>{mission.title}</Text>
                  <Text style={[styles.missionTime, { color: theme.textSecondary }]}>⏱ {mission.estimated_time || '2M'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.missionReward, { color: theme.success }]}>${(mission.reward || 0).toFixed(2)}</Text>
                  {mission.is_locked_for_new_users && <MaterialIcons name="lock" size={14} color={theme.textSecondary} />}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>No missions available.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// VOICE TASK SCREEN
// ============================================================================

// Inline task screens removed as they are now imported from ./screens/tasks/


// ============================================================================
// SIMPLE PLACEHOLDER SCREENS
// ============================================================================

// ============================================================================
// LEADERBOARD SCREEN
// ============================================================================

// LeaderboardScreen, XumJudgeScreen, and RecordsScreen moved to external files

const PlaceholderScreen = ({ title, onNavigate }: { title: string; onNavigate: (s: ScreenName) => void }) => (
  <View style={styles.screenContainer}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
        <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
    <View style={styles.placeholderContent}>
      <MaterialIcons name="construction" size={64} color={colors.textSecondary} />
      <Text style={styles.placeholderText}>Coming Soon</Text>
    </View>
  </View>
);

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.SPLASH);
  const [history, setHistory] = useState<ScreenName[]>([]);
  const [isNeuralInputVisible, setIsNeuralInputVisible] = useState(false);
  const [isContributorHubVisible, setIsContributorHubVisible] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // User session state
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const [currentTheme, setCurrentTheme] = useState<ThemeId>('solar');

  // Load theme from storage & handle Supabase Auth Session
  useEffect(() => {
    // Load theme
    AsyncStorage.getItem('themeId').then(themeId => {
      if (themeId && themePresets[themeId as ThemeId]) {
        setCurrentTheme(themeId as ThemeId);
        colors = themePresets[themeId as ThemeId]; // Update legacy colors
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        setCurrentScreen(ScreenName.HOME);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
      if (authSession) {
        setCurrentScreen(ScreenName.HOME);
      } else if (_event === 'SIGNED_OUT') {
        setCurrentScreen(ScreenName.AUTH);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load Balance & Transactions
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadWalletData = async () => {
      const [userBalance, history] = await Promise.all([
        TaskService.getUserBalance(session.user.id),
        TaskService.getTransactionHistory(session.user.id)
      ]);
      setBalance(userBalance);
      setTransactions(history);
    };

    loadWalletData();

    // Set up real-time listener for balance
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${session.user.id}` },
        () => loadWalletData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Handle Deep Linking (Magic Links / Password Reset)
  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      if (parsed.path === 'auth-callback' || url.includes('access_token=')) {
        // Potential callback logic
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase to clear any cached session
      // Clerk signOut is handled by the useClerk hook which we can't use here
      // However, once signed out from Supabase, the app will show SignedOut component
      await supabase.auth.signOut();
      // Force Clerk signout using a window message (for web)
      if (typeof window !== 'undefined' && (window as any).__clerk_frontend_api) {
        (window as any).__clerk_frontend_api.signOut();
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const navigate = (screen: ScreenName, params?: any) => {
    // Prevent pushing duplicate screens or pushing HOME
    if (screen === ScreenName.HOME) {
      setHistory([]);
    } else if (currentScreen !== screen && currentScreen !== ScreenName.SPLASH && currentScreen !== ScreenName.ONBOARDING) {
      setHistory(prev => [...prev, currentScreen]);
    }

    setCurrentScreen(screen);
    setIsNeuralInputVisible(false);
    setIsContributorHubVisible(false);
    if (params?.email) setUserEmail(params.email);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      // Default fallback
      setCurrentScreen(ScreenName.HOME);
    }
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    colors = themePresets[themeId]; // Update legacy colors
    AsyncStorage.setItem('themeId', themeId);
  };

  // Get current theme colors for dynamic styling
  const theme = themePresets[currentTheme];

  // Theme context value
  const themeContextValue: ThemeContextType = {
    theme,
    themeId: currentTheme,
    setTheme: handleThemeChange,
  };

  // Render the component
  return (
    <ClerkProvider>
      <ThemeContext.Provider value={themeContextValue}>
        <AppContent
          currentScreen={currentScreen}
          navigate={navigate}
          balance={balance}
          isNeuralInputVisible={isNeuralInputVisible}
          setIsNeuralInputVisible={setIsNeuralInputVisible}
          isContributorHubVisible={isContributorHubVisible}
          setIsContributorHubVisible={setIsContributorHubVisible}
          userEmail={userEmail}
          transactions={transactions}
          currentTheme={currentTheme}
          handleThemeChange={handleThemeChange}
          handleLogout={handleLogout}
          goBack={goBack}
        />
      </ThemeContext.Provider>
    </ClerkProvider>
  );
}

/**
 * Sub-component to use Clerk hooks inside ClerkProvider
 */
const AppContent = ({
  currentScreen,
  navigate,
  balance,
  isNeuralInputVisible,
  setIsNeuralInputVisible,
  isContributorHubVisible,
  setIsContributorHubVisible,
  userEmail,
  transactions,
  currentTheme,
  handleThemeChange,
  handleLogout,
  goBack
}: any) => {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Sync Clerk auth state to currentScreen and session-like behavior
  useEffect(() => {
    if (!isLoaded) return;

    // If we're on a "member only" screen but not signed in, go to AUTH (unless on SPLASH/ONBOARDING)
    const publicScreens = [ScreenName.SPLASH, ScreenName.ONBOARDING, ScreenName.AUTH, ScreenName.FORGOT_PASSWORD, ScreenName.OTP_VERIFICATION];
    if (!isSignedIn && !publicScreens.includes(currentScreen)) {
      navigate(ScreenName.AUTH);
    }

    // If we just signed in and are on AUTH screen, go to HOME
    if (isSignedIn && currentScreen === ScreenName.AUTH) {
      navigate(ScreenName.HOME);
    }
  }, [isLoaded, isSignedIn, currentScreen]);

  const handleClerkLogout = async () => {
    try {
      await signOut();
      await supabase.auth.signOut();
      navigate(ScreenName.AUTH);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const renderScreen = () => {
    // If not loaded yet, show minimal splash/loading
    if (!isLoaded) {
      return (
        <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    switch (currentScreen) {
      case ScreenName.SPLASH:
        return <AuthSplashScreen onNavigate={navigate} />;
      case ScreenName.ONBOARDING:
        return <AuthOnboardingScreen onNavigate={navigate} />;
      case ScreenName.AUTH:
        // Use the COLOURFULL Auth Screen (retaining design)
        return <AuthScreen onNavigate={navigate} />;
      case ScreenName.FORGOT_PASSWORD:
        return <ForgotPasswordScreen onNavigate={navigate} />;
      case ScreenName.OTP_VERIFICATION:
        return <OTPScreen onNavigate={navigate} userEmail={userEmail} />;
      case ScreenName.HOME:
        return <HomeScreen onNavigate={navigate} balance={balance} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} onOpenContributorHub={() => setIsContributorHubVisible(true)} session={{ user }} />;
      case ScreenName.WALLET:
        return <WalletScreen onNavigate={navigate} onBack={goBack} balance={balance} transactions={transactions} onOpenContributorHub={() => setIsContributorHubVisible(true)} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} session={{ user }} />;
      case ScreenName.SETTINGS:
        return <SettingsScreen onNavigate={navigate} onLogout={handleClerkLogout} onBack={goBack} />;
      case ScreenName.PROFILE:
        return <ProfileScreen onNavigate={navigate} onBack={goBack} session={{ user }} />;
      case ScreenName.EDIT_PROFILE:
        return <EditProfileScreen onNavigate={navigate} onBack={goBack} session={{ user }} />;
      case ScreenName.LEADERBOARD:
        return <LeaderboardScreen onNavigate={navigate} onBack={goBack} session={{ user }} />;
      case ScreenName.XUM_JUDGE:
        return <XumJudgeScreen onNavigate={navigate} session={{ user }} />;
      case ScreenName.TASK_MARKETPLACE:
        return <TaskMarketplaceScreen onNavigate={navigate} onBack={goBack} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} onOpenContributorHub={() => setIsContributorHubVisible(true)} session={{ user }} />;
      case ScreenName.ENVIRONMENTAL_SENSING:
        return <EnvironmentalSensingScreen onNavigate={navigate} />;
      case ScreenName.LINGUASENSE_ENGINE:
        return <LinguaSenseEngineScreen onNavigate={navigate} />;
      case ScreenName.VOICE_TASK:
        return <VoiceTaskScreen onNavigate={navigate} />;
      case ScreenName.IMAGE_TASK:
        return <ImageTaskScreen onNavigate={navigate} />;
      case ScreenName.VIDEO_TASK:
        return <VideoTaskScreen onNavigate={navigate} />;
      case ScreenName.RECORDS:
        return <RecordsScreen onNavigate={navigate} session={{ user }} />;
      case ScreenName.SUPPORT:
        return <SupportScreen onNavigate={navigate} onBack={goBack} />;
      case ScreenName.APPEARANCE_LABS:
        return <AppearanceLabsScreen onNavigate={navigate} currentTheme={currentTheme} onThemeChange={handleThemeChange} />;
      default:
        return <HomeScreen onNavigate={navigate} balance={balance} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} onOpenContributorHub={() => setIsContributorHubVisible(true)} session={{ user }} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderScreen()}
      <NeuralInputModal
        visible={isNeuralInputVisible}
        onClose={() => setIsNeuralInputVisible(false)}
        onNavigate={navigate}
      />
      <ContributorHubModal
        visible={isContributorHubVisible}
        onClose={() => setIsContributorHubVisible(false)}
        onNavigate={navigate}
        currentTheme={currentTheme}
        onLogout={handleClerkLogout}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  // Splash
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  splashLogoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  splashLogoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    opacity: 0.15,
    shadowColor: colors.primary,
    shadowRadius: 50,
    shadowOpacity: 1,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
    marginLeft: 8,
  },
  splashLine: {
    width: 40,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: 24,
  },
  splashSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 4,
    fontWeight: '700',
  },
  splashFooter: {
    position: 'absolute',
    bottom: 50,
  },
  splashFooterText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },

  // Onboarding
  onboardingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  onboardingLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  skipText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  onboardingContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  stepDot: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 40,
  },
  slideCard: {
    gap: 24,
  },
  slideIconBg: {
    width: 80,
    height: 80,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowRadius: 20,
    shadowOpacity: 0.3,
  },
  slideTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff', // Stays white because it's on a dark splash/gradient background
    lineHeight: 42,
  },
  slideDesc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 26,
    maxWidth: '90%',
  },
  onboardingFooter: {
    padding: 32,
    paddingBottom: 48,
  },
  onboardingButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    minHeight: 64,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  onboardingButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2.5,
  },

  // Header - Larger touch area, bolder title
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 64,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 3,
  },

  // Home Header - Larger, bolder welcome text
  homeHeader: {
    marginBottom: 28,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  agentText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },

  // Stats - Larger cards with better hierarchy
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  statSubtext: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Leaderboard Card - Redesigned
  networkCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
    minHeight: 180,
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  avatarTextSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  leaderboardContent: {
    flex: 1,
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  networkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
  },
  networkTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  leaderboardDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  networkNodeContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  networkNodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  networkNodeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  rankChange: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // Section - Better hierarchy
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  // Judge Card - Larger touch target, better spacing
  judgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 88,
  },
  judgeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(19, 73, 236, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  judgeInfo: {
    flex: 1,
  },
  judgeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  judgeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  judgeReward: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  judgeRewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  judgeRewardXp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  // Featured Promo Cards
  featuredPromoCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredPromoContent: {
    flex: 1,
    zIndex: 1,
  },
  featuredPromoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredPromoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  featuredPromoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  featuredPromoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: '80%',
  },
  featuredPromoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredPromoCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  featuredPromoIconBg: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    opacity: 0.3,
  },

  // Smaller Featured Cards for Horizontal Scroll
  featuredPromoCardSmall: {
    width: 260,
    borderRadius: 20,
    padding: 16,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredPromoTitleSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  featuredPromoSubtitleSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  featuredPromoIconBgRight: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    opacity: 0.4,
  },

  // Mission Card - Larger, better touch target
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 88,
  },
  missionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(19, 73, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  missionMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  missionTime: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  missionXp: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  missionReward: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 12,
  },

  // Bottom Nav - Larger touch targets
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 1,
  },
  navLabelActive: {
    color: colors.primary,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Wallet
  balanceCard: {
    borderRadius: 32,
    padding: 32,
    overflow: 'hidden',
  },
  balanceIconBg: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 1,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: '#fff',
  },

  // Settings
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  settingValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Placeholder
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
});

// ============================================================================
// TASK STYLES
// ============================================================================

const taskStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  filterRow: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#fff',
  },
  labCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  labGradient: {
    padding: 24,
    position: 'relative',
  },
  labBadge: {
    backgroundColor: 'rgba(19, 73, 236, 0.2)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  labBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1,
  },
  labTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff', // Typically on primary background, keeping white
    marginBottom: 8,
    lineHeight: 32,
  },
  labSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    maxWidth: '70%',
  },
  labButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    marginRight: 8,
  },
  labIcon: {
    position: 'absolute',
    right: 16,
    top: 24,
  },
  featuredRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  featuredCard: {
    width: 260,
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 18,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredMeta: {
    gap: 4,
  },
  featuredXp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  featuredTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  featuredReward: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
});

// ============================================================================
// CAPTURE STYLES
// ============================================================================

const captureStyles = StyleSheet.create({
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  optionIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  optionReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  promptBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  promptBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 30,
    marginBottom: 12,
  },
  promptHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  translationInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
    borderWidth: 1,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  inputCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 88,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },

  // Environmental Sensing specific
  screenTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginTop: 20,
    marginBottom: 32,
    lineHeight: 38,
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sensorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  sensorSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // LinguaSense specific
  linguaHero: {
    borderRadius: 32,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(19, 73, 236, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  linguaHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginRight: 8,
    shadowColor: '#3b82f6',
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  heroStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: '80%',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  heroStat: {
    gap: 4,
  },
  heroIcon: {
    position: 'absolute',
    right: -20,
    top: 20,
    opacity: 0.5,
  },
  infraCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infraIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infraInfo: {
    flex: 1,
  },
  infraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infraTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  infraTasks: {
    fontSize: 10,
    fontWeight: '800',
  },
  infraSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '700',
    letterSpacing: 1,
  },
});

const walletStyles = StyleSheet.create({
  balanceCard: {
    borderRadius: 32,
    padding: 32,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 32,
  },
  cardMeta: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBackgroundIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  txDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },

  // Redesign for Image 4
  balanceCardRedesign: {
    borderRadius: 32,
    padding: 32,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 240,
    justifyContent: 'center',
  },
  balanceLabelRedesign: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceValueRedesign: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
  },
  balanceActionsRedesign: {
    flexDirection: 'row',
    gap: 12,
  },
  withdrawButtonRedesign: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    flex: 1,
    alignItems: 'center',
  },
  withdrawTextRedesign: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
  },
  addFundsButtonRedesign: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconRedesign: {
    position: 'absolute',
    top: 20,
    right: -20,
    opacity: 0.15,
  },
  historyTitleRedesign: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginTop: 40,
    marginBottom: 20,
  },
  historyItemRedesign: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyIconBoxRedesign: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 73, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyInfoRedesign: {
    flex: 1,
  },
  historyTitleTextRedesign: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  historyDateRedesign: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '800',
  },
  historyAmountRedesign: {
    fontSize: 16,
    fontWeight: '900',
  },
});

const settingsStyles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 73, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f43f5e',
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginBottom: 24,
  },
});

const hubStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 28,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
    minHeight: 130,
  },
  gridIconBox: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
  list: {
    gap: 14,
    marginBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 22,
    padding: 18,
    minHeight: 72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  listContent: {
    flex: 1,
  },
  listLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  listSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderRadius: 22,
    paddingVertical: 22,
    minHeight: 64,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.15)',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#f43f5e',
    letterSpacing: 2.5,
  },
});

const profileStyles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2d3548',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#101522',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  nodeId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f59e0b',
  },
});

const themeStyles = StyleSheet.create({
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 88,
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  modeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  modeSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  toggleContainer: {
    padding: 4,
  },
  toggleTrack: {
    width: 56,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: (Dimensions.get('window').width - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
    minHeight: 120,
  },
  themeCardActive: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  themeColor: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 14,
  },
  themeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  themeBadgeActive: {
    backgroundColor: '#f59e0b',
  },
  themeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  themeBadgeTextActive: {
    color: '#fff',
  },
});

