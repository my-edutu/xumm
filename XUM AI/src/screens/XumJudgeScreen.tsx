import React, { useState, useEffect } from 'react';
import ReactNative from 'react-native';
const {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} = ReactNative;
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { TaskService } from '../services/taskService';
import { ScreenName } from '../types';
import { createGlobalStyles, createCaptureStyles } from '../styles';

interface XumJudgeScreenProps {
    onNavigate: (s: ScreenName) => void;
    session: any;
}

export const XumJudgeScreen: React.FC<XumJudgeScreenProps> = ({ onNavigate, session }) => {
    const { theme } = useTheme();
    const styles = createGlobalStyles(theme);
    const captureStyles = createCaptureStyles(theme);
    const [judgeTasks, setJudgeTasks] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        const loadData = async () => {
            setIsLoading(true);
            const [tasks, unlockStats] = await Promise.all([
                TaskService.getXumJudgeTasks(session.user.id),
                TaskService.checkJudgeUnlock(session.user.id)
            ]);
            setJudgeTasks(tasks);
            setStats(unlockStats);
            setIsLoading(false);
        };
        loadData();
    }, [session?.user?.id]);

    const isLocked = !stats?.isUnlocked;
    const userCompletedTasks = stats?.completedTasks || 0;
    const requiredTasks = stats?.requiredTasks || 10;

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>XUM JUDGE</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
                {/* Locked Banner for New Users */}
                {isLocked && (
                    <View style={[captureStyles.infoBox, { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)', marginBottom: 24 }]}>
                        <MaterialIcons name="lock" size={24} color="#f43f5e" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: theme.text, fontWeight: '600', marginBottom: 4 }}>Judge Tasks Locked</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                                Complete {Math.max(0, requiredTasks - userCompletedTasks)} more tasks to unlock XUM Judge.
                            </Text>
                            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8 }}>
                                <View style={{ height: 6, backgroundColor: theme.primary, borderRadius: 3, width: `${Math.min(100, (userCompletedTasks / requiredTasks) * 100)}%` }} />
                            </View>
                            <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>{userCompletedTasks}/{requiredTasks} tasks completed</Text>
                        </View>
                    </View>
                )}

                {/* Hero */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={[captureStyles.heroTitle, { color: theme.text }]}>Review & Earn</Text>
                    <Text style={[captureStyles.heroSubtitle, { color: theme.textSecondary }]}>
                        Judge AI outputs and help improve model accuracy. Higher rewards for experienced contributors.
                    </Text>
                </View>

                {/* Available Tasks */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>AVAILABLE TASKS</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    judgeTasks.map((task) => (
                        <TouchableOpacity
                            key={task.id}
                            style={[captureStyles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: (!task.is_unlocked) ? 0.5 : 1 }]}
                            onPress={() => task.is_unlocked && onNavigate(task.target_screen as ScreenName)}
                            disabled={!task.is_unlocked}
                        >
                            <View style={[captureStyles.optionIconBox, { backgroundColor: `${task.icon_color}15` }]}>
                                <MaterialIcons name={task.icon_name} size={28} color={task.icon_color} />
                            </View>
                            <View style={captureStyles.optionInfo}>
                                <Text style={[captureStyles.optionTitle, { color: theme.text }]}>{task.title}</Text>
                                <Text style={[captureStyles.optionSubtitle, { color: theme.textSecondary }]}>{task.subtitle}</Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>⏱ {task.estimated_time}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[captureStyles.optionReward, { color: theme.success }]}>${task.reward.toFixed(2)}</Text>
                                {!task.is_unlocked && <MaterialIcons name="lock" size={16} color={theme.textSecondary} style={{ marginTop: 4 }} />}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};
