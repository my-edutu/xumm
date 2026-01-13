import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Demo data
const DEMO_TASKS = [
    { id: '1', title: 'Audio Recording', reward: 2.50, type: 'audio', difficulty: 'easy' },
    { id: '2', title: 'Image Labeling', reward: 1.80, type: 'image', difficulty: 'medium' },
    { id: '3', title: 'Text Translation', reward: 5.00, type: 'text', difficulty: 'hard' },
    { id: '4', title: 'Data Validation', reward: 0.75, type: 'validation', difficulty: 'easy' },
];

export default function HomeScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [balance, setBalance] = useState(247.50);
    const [level, setLevel] = useState(12);
    const [xp, setXp] = useState(2450);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back</Text>
                        <Text style={styles.name}>Demo User</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>LVL {level}</Text>
                    </View>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
                    <View style={styles.xpBar}>
                        <View style={[styles.xpProgress, { width: `${(xp / 3000) * 100}%` }]} />
                    </View>
                    <Text style={styles.xpText}>{xp} / 3000 XP</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionText}>Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionText}>Stats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>🏆</Text>
                        <Text style={styles.actionText}>Ranks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionText}>Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Available Tasks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Tasks</Text>
                    {DEMO_TASKS.map((task) => (
                        <TouchableOpacity key={task.id} style={styles.taskCard}>
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                                <View style={styles.taskMeta}>
                                    <Text style={styles.taskType}>{task.type.toUpperCase()}</Text>
                                    <Text style={styles.taskDifficulty}>{task.difficulty}</Text>
                                </View>
                            </View>
                            <View style={styles.taskReward}>
                                <Text style={styles.rewardAmount}>${task.reward.toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    greeting: {
        fontSize: 14,
        color: '#94a3b8',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
    },
    levelBadge: {
        backgroundColor: '#f97316',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    levelText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    balanceCard: {
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: '#1e293b',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -1,
    },
    xpBar: {
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        marginTop: 20,
        overflow: 'hidden',
    },
    xpProgress: {
        height: '100%',
        backgroundColor: '#f97316',
        borderRadius: 3,
    },
    xpText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    actionButton: {
        alignItems: 'center',
        padding: 12,
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    actionText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 16,
    },
    taskCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 6,
    },
    taskMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    taskType: {
        fontSize: 11,
        color: '#f97316',
        fontWeight: '700',
        backgroundColor: '#f9731620',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    taskDifficulty: {
        fontSize: 11,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    taskReward: {
        backgroundColor: '#10b98120',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    rewardAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10b981',
    },
});
