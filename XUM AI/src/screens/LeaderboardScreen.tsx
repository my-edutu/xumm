import React, { useState, useEffect } from 'react';
import ReactNative from 'react-native';
const {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} = ReactNative;
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TaskService, LeaderboardEntry } from '../services/taskService';
import { ScreenName } from '../types';
import { createGlobalStyles, createCaptureStyles } from '../styles';

interface LeaderboardScreenProps {
    onNavigate: (s: ScreenName) => void;
    onBack?: () => void;
    session: any;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onNavigate, onBack, session }) => {
    const { theme } = useTheme();
    const styles = createGlobalStyles(theme);
    const captureStyles = createCaptureStyles(theme);
    const [topEarners, setTopEarners] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load Leaderboard
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await TaskService.getLeaderboard(15);
            setTopEarners(data);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const currentUserEntry = topEarners.find(e => e.user_id === session?.user?.id);
    const userRank = currentUserEntry?.rank || '-';
    const userEarnings = currentUserEntry?.total_earned || 0;

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onBack ? onBack() : onNavigate(ScreenName.HOME)}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>LEADERBOARD</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
                {/* Your Rank Card */}
                <LinearGradient colors={[theme.primary, theme.primaryDark]} style={[captureStyles.promptCard, { marginBottom: 24 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>YOUR RANK</Text>
                            <Text style={{ color: '#fff', fontSize: 48, fontWeight: '700' }}>#{userRank}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                                {topEarners.length > 0 ? `of ${topEarners.length.toLocaleString()} contributors` : '...'}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>TOTAL EARNED</Text>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>${userEarnings.toFixed(2)}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Top Earners */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>TOP EARNERS</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    topEarners.map((user, idx) => (
                        <View key={user.user_id} style={[captureStyles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 12 }]}>
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: idx < 3 ? '#f59e0b' : 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Text style={{ color: idx < 3 ? '#fff' : theme.textSecondary, fontWeight: '700', fontSize: 14 }}>{user.rank}</Text>
                            </View>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${theme.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Text style={{ color: theme.primary, fontSize: 18, fontWeight: '700' }}>{user.full_name?.[0] || '?'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{user.full_name}</Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{user.tasks_completed} tasks completed</Text>
                            </View>
                            <Text style={{ color: theme.success, fontSize: 16, fontWeight: '700' }}>${user.total_earned.toFixed(2)}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};
