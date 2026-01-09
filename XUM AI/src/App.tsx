/**
 * XUM AI - Main Application Entry Point
 * 
 * This is a hybrid React Native / React Native Web application that serves as
 * the contributor interface for the XUM AI data labeling platform.
 */

import React, { useState, useEffect } from 'react';
import {
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Import Auth Screens (Pure React Native - APK compatible)
import {
  SplashScreen as AuthSplashScreen,
  OnboardingScreen as AuthOnboardingScreen,
  AuthScreen,
  ForgotPasswordScreen,
  OTPScreen,
} from './screens/AuthScreensNative';

// ============================================================================
// TYPES
// ============================================================================

// Application screen names - used for navigation throughout the app
type AppScreenName =
  | 'SPLASH'
  | 'ONBOARDING'
  | 'AUTH'
  | 'FORGOT_PASSWORD'
  | 'OTP_VERIFICATION'
  | 'HOME'
  | 'WALLET'
  | 'SETTINGS'
  | 'PROFILE'
  | 'LEADERBOARD'
  | 'TASK_MARKETPLACE'
  | 'TASK_DETAILS'
  | 'ENVIRONMENTAL_SENSING'
  | 'LINGUASENSE_ENGINE'
  | 'TEXT_INPUT_TASK'
  | 'TASK_SUCCESS'
  | 'APPEARANCE_LABS';

interface Transaction {
  id: string;
  type: 'earn' | 'withdraw' | 'bonus';
  amount: number;
  description: string;
  date: string;
}

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
// SPLASH SCREEN
// ============================================================================

const SplashScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
  useEffect(() => {
    const timer = setTimeout(() => onNavigate('ONBOARDING'), 3000);
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
        <MaterialIcons name="psychology" size={80} color="#fff" />
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

const OnboardingScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
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

  return (
    <View style={styles.onboardingContainer}>
      <LinearGradient
        colors={['#0a0d1d', '#1349ec22']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.flex1}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingLogo}>XUM AI</Text>
          <TouchableOpacity onPress={() => onNavigate('HOME')}>
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
                onNavigate('HOME');
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
  onNavigate: (s: AppScreenName) => void;
  balance: number;
  onOpenNeuralInput: () => void;
  onOpenContributorHub: () => void;
}

const HomeScreen: React.FC<HomeProps> = ({
  onNavigate,
  balance,
  onOpenNeuralInput,
  onOpenContributorHub,
}) => {
  const { theme } = useTheme();

  const judgeTasks = [
    { id: 'j1', title: 'GENERAL KNOWLEDGE RLHF', subtitle: 'Linguistic Feedback Node', reward: 1.20, xp: 250 },
    { id: 'j2', title: 'CULTURAL CORRECTION', subtitle: 'Linguistic Feedback Node', reward: 2.50, xp: 400 },
  ];

  const missions = [
    { id: 'm1', title: 'STREET SIGN LABELING', time: '2M', xp: 25, reward: 0.50, icon: 'image' },
    { id: 'm2', title: 'LOCAL DIALECT VOICE', time: '5M', xp: 50, reward: 1.25, icon: 'mic' },
    { id: 'm3', title: 'SENTIMENT CHECK', time: '1M', xp: 10, reward: 0.15, icon: 'description' },
  ];

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.homeHeader}>
          <Text style={styles.welcomeText}>WELCOME BACK,</Text>
          <Text style={[styles.agentText, { color: theme.primary }]}>DEMO</Text>
        </View>

        {/* Stats Cards - Removed currency symbol for better UX */}
        <View style={styles.statsRow}>
          <TouchableOpacity onPress={() => onNavigate('WALLET')} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: `${theme.primary}20` }]}>
                <MaterialIcons name="stars" size={20} color={theme.primary} />
              </View>
              <Text style={styles.statLabel}>BALANCE</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.primary }]}>{balance.toFixed(0)}</Text>
            <Text style={styles.statSubtext}>XUM CREDITS</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.statIconRow}>
              <View style={[styles.statIconBg, { backgroundColor: `${theme.warning}20` }]}>
                <MaterialIcons name="pending" size={20} color={theme.warning} />
              </View>
              <Text style={styles.statLabel}>IN REVIEW</Text>
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statSubtext}>TASKS</Text>
          </View>
        </View>

        {/* Leaderboard Card - Redesigned with avatars and ranking */}
        <TouchableOpacity onPress={() => onNavigate('LEADERBOARD')}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.networkCard}>
            {/* Avatar Circles */}
            <View style={styles.avatarRow}>
              <View style={[styles.avatarCircle, { marginLeft: 0 }]}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              <View style={[styles.avatarCircle, { marginLeft: -12 }]}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View style={[styles.avatarCircle, { marginLeft: -12 }]}>
                <Text style={styles.avatarText}>K</Text>
              </View>
              <View style={[styles.avatarCircle, { marginLeft: -12, backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <Text style={styles.avatarTextSmall}>+300</Text>
              </View>
            </View>

            <View style={styles.leaderboardContent}>
              <View style={styles.networkBadge}>
                <Text style={styles.networkBadgeText}>LEADERBOARD</Text>
              </View>
              <Text style={styles.networkTitle}>Global Rankings</Text>
              <Text style={styles.leaderboardDesc}>Join 300+ contributors competing worldwide</Text>
            </View>

            <View style={styles.networkNodeContainer}>
              <Text style={styles.networkNodeLabel}>YOUR RANK</Text>
              <Text style={styles.networkNodeValue}>#142</Text>
              <Text style={styles.rankChange}>↑ 8 this week</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* XUM Judge Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>XUM JUDGE</Text>
          <TouchableOpacity onPress={() => onNavigate('TASK_MARKETPLACE')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>VIEW MORE</Text>
          </TouchableOpacity>
        </View>
        {judgeTasks.map((task) => (
          <TouchableOpacity key={task.id} onPress={() => onNavigate('TASK_DETAILS')} style={[styles.judgeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.judgeIconBox, { backgroundColor: `${theme.primary}15` }]}>
              <MaterialIcons name="gavel" size={22} color={theme.primary} />
            </View>
            <View style={styles.judgeInfo}>
              <Text style={styles.judgeTitle}>{task.title}</Text>
              <Text style={styles.judgeSubtitle}>{task.subtitle}</Text>
            </View>
            <View style={styles.judgeReward}>
              <Text style={[styles.judgeRewardValue, { color: theme.primary }]}>${task.reward.toFixed(2)}</Text>
              <Text style={styles.judgeRewardXp}>+{task.xp} XP</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Daily Missions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DAILY MISSIONS</Text>
          <TouchableOpacity onPress={() => onNavigate('TASK_MARKETPLACE')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>BROWSE ALL</Text>
          </TouchableOpacity>
        </View>
        {missions.map((mission) => (
          <TouchableOpacity key={mission.id} onPress={() => onNavigate('TASK_DETAILS')} style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.missionIconBox, { backgroundColor: `${theme.primary}15` }]}>
              <MaterialIcons name={mission.icon as any} size={22} color={theme.primary} />
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={styles.missionMeta}>
                <Text style={styles.missionTime}>⏱ {mission.time}</Text>
                <Text style={[styles.missionXp, { color: theme.primary }]}>⚡ {mission.xp} XP</Text>
              </View>
            </View>
            <Text style={[styles.missionReward, { color: theme.primary }]}>${mission.reward.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavigation
        activeScreen="HOME"
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

const EnvironmentalSensingScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
  const options = [
    { title: 'RECORD VOICE', subtitle: 'AUDIO LINGUISTIC GROUNDING.', icon: 'mic', color: '#1349ec' },
    { title: 'CAPTURE IMAGE', subtitle: 'VISUAL ENVIRONMENT MAPPING.', icon: 'camera-alt', color: '#10b981' },
    { title: 'RECORD VIDEO', subtitle: 'TEMPORAL SCENE ANALYSIS.', icon: 'videocam', color: '#f43f5e' },
    { title: 'WRITE/TYPE TEXT', subtitle: 'SEMANTIC TEXT DATASETS.', icon: 'description', color: '#f97316' },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CAPTURE DATA</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <Text style={modalStyles.screenTitle}>ENVIRONMENTAL{'\n'}SENSING</Text>
        {options.map((opt, i) => (
          <TouchableOpacity key={i} style={modalStyles.sensorCard} onPress={() => onNavigate('TASK_MARKETPLACE')}>
            <View style={[modalStyles.sensorIconBox, { backgroundColor: opt.color }]}>
              <MaterialIcons name={opt.icon as any} size={28} color="#fff" />
            </View>
            <View style={modalStyles.sensorInfo}>
              <Text style={modalStyles.sensorTitle}>{opt.title}</Text>
              <Text style={modalStyles.sensorSubtitle}>{opt.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// LINGUASENSE ENGINE SCREEN
// ============================================================================

const LinguaSenseEngineScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
  const infraItems = [
    { title: 'GROUNDING (H2D)', subtitle: 'Convert human dialects into machine intelligence.', icon: 'psychology', tasks: 42, color: '#1349ec' },
    { title: 'SYNTHESIS (D2H)', subtitle: 'Test AI comprehension of complex cultural cues.', icon: 'auto-awesome', tasks: 18, color: '#4338ca' },
    { title: 'AUDIT LAYER', subtitle: 'Identify and correct hallucinations in LLM outputs.', icon: 'security', tasks: 31, color: '#10b981' },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LINGUASENSE ENGINE</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#1e2330', '#1349ec44']} style={modalStyles.linguaHero}>
          <View style={modalStyles.linguaHeroHeader}>
            <View style={modalStyles.activeDot} />
            <Text style={modalStyles.heroStatus}>CORE SYSTEMS ACTIVE</Text>
          </View>
          <Text style={modalStyles.heroTitle}>DEEP{'\n'}LANGUAGE LAB</Text>
          <Text style={modalStyles.heroSubtitle}>Bridges the gap between human culture and artificial reasoning.</Text>
          <View style={modalStyles.heroStats}>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>GLOBAL REACHING</Text>
              <Text style={modalStyles.statValue}>114 NODES</Text>
            </View>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>DATASET PURITY</Text>
              <Text style={modalStyles.statValue}>99.8%</Text>
            </View>
            <View style={modalStyles.heroStat}>
              <Text style={modalStyles.statLabel}>HUMAN NETWORK</Text>
              <Text style={modalStyles.statValue}>2.4M</Text>
            </View>
          </View>
          <View style={modalStyles.heroIcon}>
            <MaterialIcons name="hub" size={100} color="rgba(19, 73, 236, 0.2)" />
          </View>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>NEURAL INFRASTRUCTURE</Text>
        {infraItems.map((item, i) => (
          <TouchableOpacity key={i} style={modalStyles.infraCard} onPress={() => onNavigate('TASK_MARKETPLACE')}>
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
          <Text style={modalStyles.footerText}>ENCRYPTION: AES-256</Text>
          <Text style={modalStyles.footerText}>STATUS: 200 OK</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// PROFILE SCREEN
// ============================================================================

const ProfileScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <View style={profileStyles.avatarSection}>
          <View style={profileStyles.avatarWrapper}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>DU</Text>
            </View>
            <View style={profileStyles.levelBadge}>
              <Text style={profileStyles.levelText}>L12</Text>
            </View>
          </View>
          <Text style={profileStyles.userName}>DEMO USER</Text>
          <Text style={profileStyles.nodeId}>CONTRIBUTOR NODE #0000</Text>
        </View>

        <View style={profileStyles.statsGrid}>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statLabel}>EARNINGS</Text>
            <Text style={profileStyles.statValue}>$247.50</Text>
          </View>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statLabel}>PRECISION</Text>
            <Text style={[profileStyles.statValue, { color: '#10b981' }]}>98.4%</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// APPEARANCE LABS SCREEN
// ============================================================================

interface AppearanceLabsProps {
  onNavigate: (s: AppScreenName) => void;
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

const AppearanceLabsScreen: React.FC<AppearanceLabsProps> = ({ onNavigate, currentTheme, onThemeChange }) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 56) / 2; // 20px padding each side + 16px gap

  const themes: { id: ThemeId; name: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', color: '#1349ec' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'solar', name: 'Solar', color: '#f59e0b' },
    { id: 'amoled', name: 'AMOLED', color: '#ffffff' },
    { id: 'night', name: 'Night', color: '#8b5cf6' },
    { id: 'crimson', name: 'Crimson', color: '#f43f5e' },
  ];

  const handleThemeSelect = (themeId: ThemeId) => {
    onThemeChange(themeId);
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>APPEARANCE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        {/* Current Theme Card */}
        <View style={[themeStyles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={themeStyles.modeInfo}>
            <View style={[themeStyles.modeIconBox, { backgroundColor: `${theme.primary}20` }]}>
              <MaterialIcons name="palette" size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={themeStyles.modeTitle}>Current Theme</Text>
              <Text style={[themeStyles.modeSubtitle, { color: theme.primary }]}>
                {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} • Active
              </Text>
            </View>
          </View>
          <View style={themeStyles.toggleContainer}>
            <View style={[themeStyles.toggleTrack, { backgroundColor: theme.primary }]}>
              <View style={themeStyles.toggleThumb} />
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>CHOOSE THEME</Text>

        {/* 2-Column Theme Grid */}
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
                <Text style={themeStyles.themeName}>{t.name}</Text>
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
  onNavigate: (s: AppScreenName) => void;
  currentTheme: ThemeId;
}

const ContributorHubModal: React.FC<ContributorHubModalProps> = ({ visible, onClose, onNavigate, currentTheme }) => {
  const { theme } = useTheme();

  const gridItems = [
    { label: 'PROFILE', icon: 'person', color: '#3b82f6', screen: 'PROFILE' as AppScreenName },
    { label: 'WALLET', icon: 'account-balance-wallet', color: theme.success, screen: 'WALLET' as AppScreenName },
    { label: 'COMMS', icon: 'notifications', color: theme.warning },
    { label: 'RANKING', icon: 'military-tech', color: '#a855f7' },
  ];

  const listItems = [
    { label: 'THEME', icon: 'palette', subtitle: `${currentTheme.toUpperCase()} MODE`, screen: 'APPEARANCE_LABS' as AppScreenName },
    { label: 'SETTINGS', icon: 'settings', screen: 'SETTINGS' as AppScreenName },
    { label: 'SUPPORT', icon: 'help-center' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 72) / 2;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={hubStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[hubStyles.container, { backgroundColor: theme.background }]}>
          <View style={hubStyles.dragHandle} />
          <View style={hubStyles.header}>
            <Text style={hubStyles.title}>CONTRIBUTOR HUB</Text>
            <TouchableOpacity onPress={onClose} style={hubStyles.closeButton}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* 2x2 Grid */}
          <View style={hubStyles.grid}>
            {gridItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[hubStyles.gridItem, { width: cardWidth, backgroundColor: theme.surface }]}
                onPress={() => item.screen && onNavigate(item.screen)}
              >
                <View style={[hubStyles.gridIconBox, { backgroundColor: item.color }]}>
                  <MaterialIcons name={item.icon as any} size={28} color="#fff" />
                </View>
                <Text style={hubStyles.gridLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={hubStyles.list}>
            {listItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[hubStyles.listItem, { backgroundColor: theme.surface }]}
                onPress={() => item.screen && onNavigate(item.screen)}
              >
                <View style={[hubStyles.listIconBox, { backgroundColor: `${theme.primary}15` }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={theme.primary} />
                </View>
                <View style={hubStyles.listContent}>
                  <Text style={hubStyles.listLabel}>{item.label}</Text>
                  {item.subtitle && <Text style={[hubStyles.listSubtitle, { color: theme.primary }]}>{item.subtitle}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={hubStyles.logoutButton}>
            <MaterialIcons name="logout" size={20} color={theme.error} />
            <Text style={[hubStyles.logoutText, { color: theme.error }]}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// NEURAL INPUT MODAL - Redesigned with better UX
// ============================================================================

const NeuralInputModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onNavigate: (s: AppScreenName) => void;
}> = ({ visible, onClose, onNavigate }) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={modalStyles.container}>
          <View style={modalStyles.dragHandle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>CREATE TASK</Text>
            <Text style={modalStyles.subtitle}>Choose your input method</Text>
          </View>

          <View style={modalStyles.content}>
            <TouchableOpacity
              style={modalStyles.cardWrapper}
              onPress={() => { onClose(); onNavigate('ENVIRONMENTAL_SENSING'); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[theme.primary, theme.primaryDark]} style={modalStyles.inputCard}>
                <View style={modalStyles.cardContent}>
                  <View style={modalStyles.iconCircle}>
                    <MaterialIcons name="photo-camera" size={28} color="#fff" />
                  </View>
                  <View style={modalStyles.cardTextContainer}>
                    <Text style={modalStyles.cardTitle}>Image & Camera</Text>
                    <Text style={modalStyles.cardSubtitle}>Capture photos, label objects, scan signs</Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.cardWrapper}
              onPress={() => { onClose(); onNavigate('LINGUASENSE_ENGINE'); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#8b5cf6', '#6366f1']} style={modalStyles.inputCard}>
                <View style={modalStyles.cardContent}>
                  <View style={modalStyles.iconCircle}>
                    <MaterialIcons name="mic" size={28} color="#fff" />
                  </View>
                  <View style={modalStyles.cardTextContainer}>
                    <Text style={modalStyles.cardTitle}>Voice & Text</Text>
                    <Text style={modalStyles.cardSubtitle}>Record audio, translate, rate responses</Text>
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

const WalletScreen: React.FC<{
  onNavigate: (s: AppScreenName) => void;
  balance: number;
  transactions: Transaction[];
  onOpenContributorHub: () => void;
  onOpenNeuralInput: () => void;
}> = ({ onNavigate, balance, transactions, onOpenContributorHub, onOpenNeuralInput }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WALLET</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={[theme.primary, theme.primaryDark]} style={walletStyles.balanceCardRedesign}>
          <Text style={walletStyles.balanceLabelRedesign}>AVAILABLE BALANCE</Text>
          <Text style={walletStyles.balanceValueRedesign}>${balance.toFixed(2)}</Text>

          <View style={walletStyles.balanceActionsRedesign}>
            <TouchableOpacity style={walletStyles.withdrawButtonRedesign}>
              <Text style={walletStyles.withdrawTextRedesign}>WITHDRAW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[walletStyles.addFundsButtonRedesign, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={walletStyles.cardIconRedesign}>
            <MaterialIcons name="account-balance-wallet" size={120} color="rgba(255,255,255,0.1)" />
          </View>
        </LinearGradient>

        <Text style={walletStyles.historyTitleRedesign}>HANDSHAKE HISTORY</Text>

        {transactions.map((tx) => (
          <View key={tx.id} style={[walletStyles.historyItemRedesign, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[walletStyles.historyIconBoxRedesign, { backgroundColor: `${theme.primary}15` }]}>
              <MaterialIcons
                name={tx.type === 'earn' ? 'image' : tx.type === 'withdraw' ? 'north-east' : 'verified'}
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={walletStyles.historyInfoRedesign}>
              <Text style={walletStyles.historyTitleTextRedesign}>{tx.description.toUpperCase()}</Text>
              <Text style={walletStyles.historyDateRedesign}>{tx.date.toUpperCase()}</Text>
            </View>
            <Text style={[
              walletStyles.historyAmountRedesign,
              tx.type === 'earn' ? { color: theme.success } : { color: '#fff' }
            ]}>
              {tx.type === 'earn' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <BottomNavigation
        activeScreen="WALLET"
        onNavigate={onNavigate}
        onOpenNeuralInput={onOpenNeuralInput}
        onOpenContributorHub={onOpenContributorHub}
      />
    </View>
  );
};

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

const BottomNavigation: React.FC<{
  activeScreen: AppScreenName;
  onNavigate: (s: AppScreenName) => void;
  onOpenNeuralInput: () => void;
  onOpenContributorHub: () => void;
}> = ({ activeScreen, onNavigate, onOpenNeuralInput, onOpenContributorHub }) => {
  const { theme } = useTheme();

  const navItems: { label: string; icon: string; screen?: AppScreenName; action?: () => void }[] = [
    { label: 'HOME', icon: 'home', screen: 'HOME' },
    { label: 'TASK', icon: 'explore', screen: 'TASK_MARKETPLACE' },
    { label: 'ADD', icon: 'add', action: onOpenNeuralInput },
    { label: 'WALLET', icon: 'account-balance-wallet', screen: 'WALLET' },
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

const SettingsScreen: React.FC<{ onNavigate: (s: AppScreenName) => void }> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Profile', icon: 'person', value: 'Demo User', screen: 'PROFILE' as AppScreenName },
        { label: 'Security', icon: 'shield', value: 'Verified' },
        { label: 'Payment Methods', icon: 'credit-card', value: '2 cards' },
      ],
    },
    {
      title: 'APP SETTINGS',
      items: [
        { label: 'Appearance', icon: 'palette', value: 'Dark', screen: 'APPEARANCE_LABS' as AppScreenName },
        { label: 'Notifications', icon: 'notifications', value: 'On' },
        { label: 'Language', icon: 'language', value: 'English' },
        { label: 'Data & Storage', icon: 'storage', value: '14.2 MB' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help Center', icon: 'help', value: '' },
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
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
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

        <TouchableOpacity style={[settingsStyles.logoutButton, { borderColor: theme.error }]}>
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
  onNavigate: (s: AppScreenName) => void;
  onOpenContributorHub: () => void;
  onOpenNeuralInput: () => void;
}

const TaskMarketplaceScreen: React.FC<TaskMarketplaceProps> = ({ onNavigate, onOpenContributorHub, onOpenNeuralInput }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const filters = ['ALL', 'AUDIO', 'TEXT', 'IMAGE'];

  const featuredTasks = [
    { id: 'f1', title: 'AI PERCEPTION LAB', subtitle: 'Validate object depth in 3D lidar scans.', xp: 50, time: '3M', reward: 2.50, colors: ['#7c3aed', '#a855f7'] as [string, string] },
    { id: 'f2', title: 'NEURAL ALIGNMENT', subtitle: 'Review high-stakes AI safety.', xp: 35, time: '2M', reward: 1.80, colors: ['#ec4899', '#f43f5e'] as [string, string] },
  ];

  const missions = [
    { id: 'm1', title: 'STREET SIGN LABELING', time: '2M', xp: 25, reward: 0.50, icon: 'image', color: '#3b82f6' },
    { id: 'm2', title: 'LOCAL DIALECT RECORDING', time: '5M', xp: 50, reward: 1.25, icon: 'mic', color: '#8b5cf6' },
    { id: 'm3', title: 'SENTIMENT ANALYSIS', time: '1M', xp: 10, reward: 0.15, icon: 'description', color: '#06b6d4' },
    { id: 'm4', title: 'OBJECT DETECTION', time: '3M', xp: 30, reward: 0.75, icon: 'image-search', color: '#f97316' },
  ];

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('HOME')}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TASK</Text>
        <TouchableOpacity>
          <MaterialIcons name="refresh" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={taskStyles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={taskStyles.searchInput}
            placeholder="Search active protocols..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={taskStyles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[taskStyles.filterPill, activeFilter === filter && taskStyles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[taskStyles.filterText, activeFilter === filter && taskStyles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Laboratory Card */}
        <View style={taskStyles.labCard}>
          <LinearGradient colors={['#1e2330', '#2d3548']} style={taskStyles.labGradient}>
            <View style={taskStyles.labBadge}>
              <Text style={taskStyles.labBadgeText}>LABORATORY</Text>
            </View>
            <Text style={taskStyles.labTitle}>TRAIN YOUR{'\n'}OWN AI</Text>
            <Text style={taskStyles.labSubtitle}>Personalize models with your data and preferences.</Text>
            <TouchableOpacity style={taskStyles.labButton} onPress={() => onNavigate('ENVIRONMENTAL_SENSING')}>
              <Text style={taskStyles.labButtonText}>OPEN NEURAL LAB</Text>
              <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
            <View style={taskStyles.labIcon}>
              <MaterialIcons name="psychology" size={80} color="rgba(19, 73, 236, 0.3)" />
            </View>
          </LinearGradient>
        </View>

        {/* Featured Tasks */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 24 }]}>FEATURED TASKS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={taskStyles.featuredRow}
        >
          {featuredTasks.map((task) => (
            <TouchableOpacity key={task.id} onPress={() => onNavigate('TASK_DETAILS')}>
              <LinearGradient colors={task.colors} style={taskStyles.featuredCard}>
                <View style={taskStyles.featuredBadge}>
                  <Text style={taskStyles.featuredBadgeText}>PRIORITY CONTRACT</Text>
                </View>
                <Text style={taskStyles.featuredTitle}>{task.title}</Text>
                <Text style={taskStyles.featuredSubtitle}>{task.subtitle}</Text>
                <View style={taskStyles.featuredFooter}>
                  <View style={taskStyles.featuredMeta}>
                    <Text style={taskStyles.featuredXp}>⚡ {task.xp} XP</Text>
                    <Text style={taskStyles.featuredTime}>⏱ {task.time}</Text>
                  </View>
                  <Text style={taskStyles.featuredReward}>${task.reward.toFixed(2)}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Available Missions */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, marginTop: 24, marginBottom: 16 }]}>
          AVAILABLE MISSIONS
        </Text>
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {missions.map((mission) => (
            <TouchableOpacity key={mission.id} onPress={() => onNavigate('TASK_DETAILS')} style={styles.missionCard}>
              <View style={[styles.missionIconBox, { backgroundColor: `${mission.color}20` }]}>
                <MaterialIcons name={mission.icon as any} size={22} color={mission.color} />
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <View style={styles.missionMeta}>
                  <Text style={styles.missionTime}>⏱ {mission.time}</Text>
                  <Text style={styles.missionXp}>⚡ {mission.xp} XP</Text>
                </View>
              </View>
              <Text style={styles.missionReward}>${mission.reward.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// SIMPLE PLACEHOLDER SCREENS
// ============================================================================

const PlaceholderScreen: React.FC<{ title: string; onNavigate: (s: AppScreenName) => void }> = ({
  title,
  onNavigate,
}) => (
  <View style={styles.screenContainer}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => onNavigate('HOME')}>
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
  const [currentScreen, setCurrentScreen] = useState<AppScreenName>('SPLASH');
  const [isNeuralInputVisible, setIsNeuralInputVisible] = useState(false);
  const [isContributorHubVisible, setIsContributorHubVisible] = useState(false);
  const [balance, setBalance] = useState(247.50);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('solar');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'earn', amount: 2.50, description: 'Task Reward: Image Labeling', date: 'Today, 10:42 AM' },
    { id: '2', type: 'withdraw', amount: 100.00, description: 'Withdrawal to PayPal', date: 'Yesterday' },
    { id: '3', type: 'bonus', amount: 5.00, description: 'Quality Bonus', date: 'Nov 12' },
  ]);

  // Update global colors when theme changes
  useEffect(() => {
    colors = themePresets[currentTheme];
  }, [currentTheme]);

  const navigate = (screen: AppScreenName) => {
    setCurrentScreen(screen);
    setIsNeuralInputVisible(false);
    setIsContributorHubVisible(false);
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    colors = themePresets[themeId];
  };

  // Get current theme colors for dynamic styling
  const theme = themePresets[currentTheme];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <AuthSplashScreen onNavigate={(s) => navigate(s as AppScreenName)} />;
      case 'ONBOARDING':
        return <AuthOnboardingScreen onNavigate={(s) => navigate(s as AppScreenName)} />;
      case 'AUTH':
        return <AuthScreen onNavigate={(s) => navigate(s as AppScreenName)} />;
      case 'FORGOT_PASSWORD':
        return <ForgotPasswordScreen onNavigate={(s) => navigate(s as AppScreenName)} />;
      case 'OTP_VERIFICATION':
        return <OTPScreen onNavigate={(s) => navigate(s as AppScreenName)} />;
      case 'HOME':
        return <HomeScreen onNavigate={navigate} balance={balance} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} onOpenContributorHub={() => setIsContributorHubVisible(true)} />;
      case 'WALLET':
        return <WalletScreen onNavigate={navigate} balance={balance} transactions={transactions} onOpenContributorHub={() => setIsContributorHubVisible(true)} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} />;
      case 'SETTINGS':
        return <SettingsScreen onNavigate={navigate} />;
      case 'PROFILE':
        return <ProfileScreen onNavigate={navigate} />;
      case 'LEADERBOARD':
        return <PlaceholderScreen title="LEADERBOARD" onNavigate={navigate} />;
      case 'TASK_MARKETPLACE':
        return <TaskMarketplaceScreen onNavigate={navigate} onOpenContributorHub={() => setIsContributorHubVisible(true)} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} />;
      case 'TASK_DETAILS':
        return <PlaceholderScreen title="TASK DETAILS" onNavigate={navigate} />;
      case 'ENVIRONMENTAL_SENSING':
        return <EnvironmentalSensingScreen onNavigate={navigate} />;
      case 'LINGUASENSE_ENGINE':
        return <LinguaSenseEngineScreen onNavigate={navigate} />;
      case 'APPEARANCE_LABS':
        return <AppearanceLabsScreen onNavigate={navigate} currentTheme={currentTheme} onThemeChange={handleThemeChange} />;
      default:
        return <HomeScreen onNavigate={navigate} balance={balance} onOpenNeuralInput={() => setIsNeuralInputVisible(true)} onOpenContributorHub={() => setIsContributorHubVisible(true)} />;
    }
  };

  // Theme context value
  const themeContextValue: ThemeContextType = {
    theme,
    themeId: currentTheme,
    setTheme: handleThemeChange,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
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
        />
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

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
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
    marginLeft: 8, // Offset for letterSpacing
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
    fontWeight: '900',
    color: '#fff',
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
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 3,
  },

  // Home Header - Larger, bolder welcome text
  homeHeader: {
    marginBottom: 28,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  agentText: {
    fontSize: 36,
    fontWeight: '900',
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
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
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
    fontWeight: '900',
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
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
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
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2.5,
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
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
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
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  judgeRewardXp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
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
    width: 200,
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
    fontSize: 56,
    fontWeight: '900',
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
    fontSize: 20,
    fontWeight: '900',
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
    gap: 16,
  },
  themeCard: {
    width: (Dimensions.get('window').width - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
    minHeight: 160,
  },
  themeCardActive: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  themeColor: {
    width: 72,
    height: 72,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  themeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
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

