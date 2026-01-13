import React, { useState } from 'react';
import ReactNative from 'react-native';
const { View, Text, TouchableOpacity, ScrollView, TextInput } = ReactNative;
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenName } from '../types';
import { Header } from '../components/Shared';

interface AdminScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

/**
 * Admin Login Screen
 * Provides authentication for administrative access to the platform.
 */
export const AdminLoginScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        // TODO: Implement actual admin authentication
        setTimeout(() => {
            setLoading(false);
            onNavigate(ScreenName.ADMIN_DASHBOARD);
        }, 1500);
    };

    return (
        <View className="flex-1 bg-[#0a0d1d]">
            <LinearGradient
                colors={['rgba(19, 73, 236, 0.4)', 'transparent']}
                className="h-56 relative w-full"
            >
                <View className="flex-1 justify-end p-8 pb-8">
                    <TouchableOpacity
                        onPress={() => onNavigate(ScreenName.AUTH)}
                        className="absolute top-12 left-6"
                    >
                        <MaterialIcons name="arrow-back" size={28} color="#ffffff66" />
                    </TouchableOpacity>
                    <Text className="text-white text-4xl font-bold tracking-tighter mb-2">
                        Admin<Text className="text-cyan-400">.</Text>
                    </Text>
                    <Text className="text-white/40 text-sm font-semibold uppercase tracking-[2px]">
                        Control Terminal
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-8" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="gap-5 mt-4">
                    <View>
                        <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">
                            Admin Email
                        </Text>
                        <View className="relative justify-center">
                            <MaterialIcons
                                name="alternate-email"
                                size={20}
                                color="#ffffff33"
                                style={{ position: 'absolute', left: 16, zIndex: 10 }}
                            />
                            <TextInput
                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-medium"
                                placeholder="admin@xum.ai"
                                placeholderTextColor="#ffffff33"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">
                            Access Key
                        </Text>
                        <View className="relative justify-center">
                            <MaterialIcons
                                name="lock-open"
                                size={20}
                                color="#ffffff33"
                                style={{ position: 'absolute', left: 16, zIndex: 10 }}
                            />
                            <TextInput
                                className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-12 text-white font-medium"
                                placeholder="••••••••"
                                placeholderTextColor="#ffffff33"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: 16 }}
                            >
                                <MaterialIcons
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#ffffff4d"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full h-14 bg-white rounded-2xl items-center justify-center mt-4"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-black font-bold uppercase tracking-widest">
                            {loading ? 'Authenticating...' : 'Access Terminal'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

/**
 * Admin Dashboard Screen
 * Main control hub for administrative operations.
 */
export const AdminDashboardScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
    const adminModules = [
        {
            title: 'User Management',
            subtitle: 'Manage contributor accounts',
            icon: 'people',
            color: '#3b82f6',
            screen: ScreenName.ADMIN_USER_MANAGEMENT,
        },
        {
            title: 'Task Moderation',
            subtitle: 'Review pending submissions',
            icon: 'fact-check',
            color: '#10b981',
            screen: ScreenName.ADMIN_TASK_MODERATION,
        },
        {
            title: 'Payouts',
            subtitle: 'Process withdrawal requests',
            icon: 'payments',
            color: '#f59e0b',
            screen: ScreenName.ADMIN_PAYOUTS,
        },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <Header title="Admin Terminal" onBack={() => onNavigate(ScreenName.HOME)} />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stats Overview */}
                <View className="mt-6">
                    <LinearGradient
                        colors={['#1349ec', '#4338ca']}
                        className="rounded-3xl p-8 overflow-hidden relative"
                    >
                        <View className="absolute top-0 right-0 opacity-10">
                            <MaterialIcons name="admin-panel-settings" size={120} color="white" />
                        </View>
                        <View className="relative z-10">
                            <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                                System Status
                            </Text>
                            <Text className="text-3xl font-bold text-white tracking-tighter">
                                All Systems Operational
                            </Text>
                            <View className="flex-row items-center gap-2 mt-3">
                                <MaterialIcons name="check-circle" size={16} color="#34d399" />
                                <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                    Network Healthy
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Admin Modules */}
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 mb-4 px-2">
                    Control Modules
                </Text>
                <View className="gap-4">
                    {adminModules.map((module, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onNavigate(module.screen)}
                            className="flex-row items-center p-5 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800"
                        >
                            <View
                                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                style={{ backgroundColor: `${module.color}20` }}
                            >
                                <MaterialIcons name={module.icon as any} size={24} color={module.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                                    {module.title}
                                </Text>
                                <Text className="text-xs text-slate-500 mt-1">{module.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={() => onNavigate(ScreenName.AUTH)}
                    className="flex-row items-center justify-center h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mt-8"
                >
                    <MaterialIcons name="logout" size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold uppercase tracking-widest text-sm ml-3">
                        Terminate Session
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

/**
 * User Management Screen
 * Allows admins to view and manage contributor accounts.
 */
export const UserManagementScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
    const mockUsers = [
        { id: '1', name: 'Elena S.', email: 'elena@example.com', status: 'active', balance: 245.5 },
        { id: '2', name: 'Marcus W.', email: 'marcus@example.com', status: 'active', balance: 189.0 },
        { id: '3', name: 'Sarah K.', email: 'sarah@example.com', status: 'suspended', balance: 52.25 },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <Header title="User Management" onBack={() => onNavigate(ScreenName.ADMIN_DASHBOARD)} />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-6 mb-4 px-2">
                    Active Contributors
                </Text>
                <View className="gap-4">
                    {mockUsers.map((user) => (
                        <View
                            key={user.id}
                            className="p-5 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-4">
                                    <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center">
                                        <Text className="text-white font-bold">
                                            {user.name.split(' ').map((n) => n[0]).join('')}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                                            {user.name}
                                        </Text>
                                        <Text className="text-xs text-slate-500 mt-1">{user.email}</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-primary">${user.balance.toFixed(2)}</Text>
                                    <View
                                        className={`px-2 py-1 rounded-full mt-1 ${user.status === 'active' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-bold uppercase ${user.status === 'active' ? 'text-emerald-500' : 'text-red-500'
                                                }`}
                                        >
                                            {user.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

/**
 * Task Moderation Screen
 * Allows admins to review and approve/reject task submissions.
 */
export const TaskModerationScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
    const pendingTasks = [
        { id: '1', type: 'audio', user: 'Elena S.', reward: 1.25, status: 'pending' },
        { id: '2', type: 'image', user: 'Marcus W.', reward: 0.5, status: 'pending' },
        { id: '3', type: 'text', user: 'Sarah K.', reward: 0.15, status: 'pending' },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <Header title="Task Moderation" onBack={() => onNavigate(ScreenName.ADMIN_DASHBOARD)} />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-6 mb-4 px-2">
                    Pending Review
                </Text>
                <View className="gap-4">
                    {pendingTasks.map((task) => (
                        <View
                            key={task.id}
                            className="p-5 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800"
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                                        <MaterialIcons
                                            name={task.type === 'audio' ? 'mic' : task.type === 'image' ? 'image' : 'description'}
                                            size={20}
                                            color="#1349ec"
                                        />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                                            {task.type} Submission
                                        </Text>
                                        <Text className="text-xs text-slate-500">By {task.user}</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-primary">${task.reward.toFixed(2)}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 h-10 bg-emerald-500 rounded-xl items-center justify-center">
                                    <Text className="text-white font-bold text-xs uppercase">Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 h-10 bg-red-500/10 rounded-xl items-center justify-center border border-red-500/20">
                                    <Text className="text-red-500 font-bold text-xs uppercase">Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

/**
 * Admin Payouts Screen
 * Allows admins to process and manage withdrawal requests.
 */
export const AdminPayoutsScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
    const payoutRequests = [
        { id: '1', user: 'Elena S.', amount: 100.0, method: 'PayPal', status: 'pending' },
        { id: '2', user: 'Marcus W.', amount: 50.0, method: 'Bank Transfer', status: 'pending' },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            <Header title="Payout Requests" onBack={() => onNavigate(ScreenName.ADMIN_DASHBOARD)} />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Summary Card */}
                <View className="mt-6 p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                                Pending Payouts
                            </Text>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white">$150.00</Text>
                        </View>
                        <View className="w-14 h-14 rounded-2xl bg-orange-500/20 items-center justify-center">
                            <MaterialIcons name="payments" size={28} color="#f59e0b" />
                        </View>
                    </View>
                </View>

                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 mb-4 px-2">
                    Withdrawal Queue
                </Text>
                <View className="gap-4">
                    {payoutRequests.map((payout) => (
                        <View
                            key={payout.id}
                            className="p-5 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800"
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                                        {payout.user}
                                    </Text>
                                    <Text className="text-xs text-slate-500 mt-1">{payout.method}</Text>
                                </View>
                                <Text className="font-bold text-xl text-slate-900 dark:text-white">
                                    ${payout.amount.toFixed(2)}
                                </Text>
                            </View>
                            <TouchableOpacity className="h-12 bg-primary rounded-xl items-center justify-center">
                                <Text className="text-white font-bold uppercase tracking-widest text-xs">
                                    Process Payout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
