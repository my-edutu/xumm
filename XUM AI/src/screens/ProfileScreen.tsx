import React from 'react';
import ReactNative from 'react-native';
const { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions } = ReactNative;
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { ScreenName } from '../types';
import { TaskService } from '../services/taskService';
import { useState, useEffect } from 'react';

interface ProfileScreenProps {
    onNavigate: (screen: any) => void;
    onBack?: () => void;
    session: any;
}

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onBack, session }) => {
    const { theme } = useTheme();

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            TaskService.getUserTaskStats(session.user.id).then(data => {
                setStats(data);
                setLoading(false);
            });
        }
    }, [session?.user?.id]);

    const profileStats = {
        totalEarnings: stats?.totalEarned || 0,
        tasksCompleted: stats?.approved || 0,
        dataContributed: '0 MB', // Placeholder as backend doesn't track size yet
        precision: 98.4, // Placeholder
        globalRank: 127, // Placeholder
        memberSince: 'Jan 2026',
        level: Math.floor((stats?.approved || 0) / 10) + 1,
        xp: (stats?.approved || 0) * 15, // Approx XP
        targetXp: (Math.floor((stats?.approved || 0) / 10) + 1) * 150,
    };

    // Simplified mapping based on available data
    const contributionData = [
        { label: 'Voice', count: stats?.voiceCount || 0, icon: 'mic', color: '#8b5cf6', progress: 0.5 },
        { label: 'Images', count: stats?.imageCount || 0, icon: 'photo-camera', color: '#3b82f6', progress: 0.5 },
        { label: 'Videos', count: stats?.videoCount || 0, icon: 'videocam', color: '#ec4899', progress: 0.5 },
    ];

    const menuItems = [
        { label: 'Edit Profile', icon: 'edit', screen: ScreenName.EDIT_PROFILE },
        { label: 'My Records', icon: 'history', screen: ScreenName.RECORDS },
        { label: 'Wallet', icon: 'account-balance-wallet', screen: ScreenName.WALLET },
        { label: 'Settings', icon: 'settings', screen: ScreenName.SETTINGS },
        { label: 'Help Centre', icon: 'help-outline', screen: 'SUPPORT' as any },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onBack ? onBack() : onNavigate(ScreenName.HOME)} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>MY PROFILE</Text>
                <TouchableOpacity onPress={() => onNavigate(ScreenName.SETTINGS)}>
                    <MaterialIcons name="more-vert" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <LinearGradient
                    colors={[theme.primary, theme.primaryDark]}
                    style={styles.profileCard}
                >
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatarGlow, { backgroundColor: theme.primaryLight }]} />
                            <View style={styles.avatarBorder}>
                                <Image
                                    source={{ uri: session?.user?.imageUrl || 'https://i.pravatar.cc/150?u=' + session?.user?.id }}
                                    style={styles.avatar}
                                />
                            </View>
                            <View style={[styles.levelBadge, { backgroundColor: theme.accent }]}>
                                <Text style={styles.levelText}>{profileStats.level}</Text>
                            </View>
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {session?.user?.firstName || session?.user?.fullName?.split(' ')[0] || 'CONTRIBUTOR'}
                            </Text>
                            <Text style={styles.userEmail}>{session?.user?.primaryEmailAddress?.emailAddress}</Text>
                            <View style={styles.xpBarContainer}>
                                <View style={[styles.xpBarBackground, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <View style={[styles.xpBarFill, { width: `${(profileStats.xp / profileStats.targetXp) * 100}%`, backgroundColor: '#fff' }]} />
                                </View>
                                <Text style={styles.xpText}>{profileStats.xp} / {profileStats.targetXp} XP</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.rankBadge}>
                        <Text style={styles.rankLabel}>GLOBAL RANK</Text>
                        <Text style={styles.rankValue}>#{profileStats.globalRank}</Text>
                    </View>
                </LinearGradient>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.statValueText, { color: theme.success }]}>${profileStats.totalEarnings.toFixed(2)}</Text>
                        <Text style={[styles.statLabelText, { color: theme.textSecondary }]}>Total Earned</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.statValueText, { color: theme.primary }]}>{profileStats.precision}%</Text>
                        <Text style={[styles.statLabelText, { color: theme.textSecondary }]}>Accuracy</Text>
                    </View>
                </View>

                {/* My Contributions - Premium Redesign */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>MY CONTRIBUTIONS</Text>
                    <TouchableOpacity onPress={() => onNavigate(ScreenName.RECORDS)}>
                        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>VIEW LOGS</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contributionsGrid}>
                    {contributionData.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.contributionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                                <MaterialIcons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <View style={styles.contributionInfo}>
                                <View style={styles.contributionHeader}>
                                    <Text style={[styles.contributionLabel, { color: theme.text }]}>{item.label}</Text>
                                    <Text style={[styles.contributionCount, { color: item.color }]}>{item.count}</Text>
                                </View>
                                <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                                    <View style={[styles.progressBarFill, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Menu Items */}
                <View style={[styles.menuContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                            onPress={() => onNavigate(item.screen)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: `${theme.primary}10` }]}>
                                    <MaterialIcons name={item.icon as any} size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.footerText}>XUM Node Connection: ACTIVE</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 56,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    profileCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    profileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatarGlow: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        top: -5,
        left: -5,
        opacity: 0.3,
    },
    avatarBorder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    levelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    userEmail: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    xpBarContainer: {
        marginTop: 12,
    },
    xpBarBackground: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    xpText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 4,
        opacity: 0.8,
    },
    rankBadge: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    rankLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1,
    },
    rankValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    statValueText: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabelText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    contributionsGrid: {
        gap: 12,
        marginBottom: 32,
    },
    contributionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contributionInfo: {
        flex: 1,
    },
    contributionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    contributionLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    contributionCount: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    menuContainer: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 2,
        marginBottom: 20,
    },
});
