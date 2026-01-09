import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenName, Transaction, Theme, UserProfile, DashboardScreenProps } from '../types';
import { Header, BottomNav } from '../components/Shared';
import { supabase } from '../supabaseClient';

// ============================================================================
// SERVICES
// ============================================================================

interface WithdrawalResult {
  status: 'success' | 'error';
  id?: string;
  message?: string;
}

const WalletService = {
  requestWithdrawal: async (
    amount: number,
    method: string,
    details: Record<string, unknown>
  ): Promise<WithdrawalResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc('request_withdrawal', {
        p_user_id: user.id,
        p_amount: amount,
        p_method: method,
        p_account_details: details
      });

      if (error) throw error;
      return { status: 'success', id: data };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Handshake rejected';
      console.error("Protocol error during liquidity transfer", e);
      return { status: 'error', message: errorMessage };
    }
  }
};

// ============================================================================
// TYPES
// ============================================================================

interface ScreenProps extends DashboardScreenProps {
  onConfirm?: (amount: number, method: string) => void;
}

const iconMap: Record<string, string> = {
  'account_balance_wallet': 'account-balance-wallet',
  'hourglass_top': 'hourglass-top',
  'public': 'public',
  'check_circle': 'check-circle',
  'gavel': 'gavel',
  'auto_fix_high': 'auto-fix-high',
  'image': 'image',
  'mic': 'mic',
  'description': 'description',
  'schedule': 'schedule',
  'bolt': 'bolt',
  'image_search': 'image-search',
  'arrow_outward': 'arrow-outward',
  'award_star': 'star',
  'translate': 'translate',
  'verified': 'verified',
  'payments': 'payments',
  'security': 'security',
  'add': 'add',
};

export const HomeScreen: React.FC<ScreenProps> = (props) => {
  const { onNavigate, balance, profile } = props;

  const judgeTasks = [
    { title: 'General Knowledge RLHF', reward: '250 XP', pay: '$1.20', icon: 'gavel', color: 'primary', screen: ScreenName.XUM_JUDGE },
    { title: 'Cultural Correction', reward: '400 XP', pay: '$2.50', icon: 'auto-fix-high', color: 'purple', screen: ScreenName.RLHF_CORRECTION }
  ];

  const quickTasks = [
    { id: '1', title: 'Street Sign Labeling', type: 'image', reward: '$0.50', xp: '25', time: '2m', icon: 'image' },
    { id: '2', title: 'Local Dialect Voice', type: 'audio', reward: '$1.25', xp: '50', time: '5m', icon: 'mic' },
    { id: '3', title: 'Sentiment Check', type: 'text', reward: '$0.15', xp: '10', time: '1m', icon: 'description' }
  ];

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="p-6 pt-12 bg-white/90 dark:bg-background-dark/90">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">
            Welcome back,{'\n'}<Text className="text-primary">{profile?.full_name?.split(' ')[0] || 'Agent'}</Text>
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-4 gap-4">
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => onNavigate(ScreenName.WALLET)} className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <MaterialIcons name="account-balance-wallet" size={20} color="#3b82f6" />
                </View>
                <Text className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Earned</Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">${balance?.toFixed(2)}</Text>
            </TouchableOpacity>

            <View className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <MaterialIcons name="hourglass-top" size={20} color="#f97316" />
                </View>
                <Text className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Pending</Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">$24.00</Text>
            </View>
          </View>

          {/* Network Status Card */}
          <TouchableOpacity onPress={() => onNavigate(ScreenName.LEADERBOARD)}>
            <LinearGradient colors={['#1349ec', '#4338ca']} style={{ borderRadius: 24, padding: 24, overflow: 'hidden' }}>
              <View className="absolute top-0 right-0 p-4 opacity-10">
                <MaterialIcons name="public" size={100} color="white" />
              </View>
              <View className="relative z-10">
                <View className="px-3 py-1 bg-white/20 rounded-full self-start mb-2">
                  <Text className="text-white text-[10px] font-semibold uppercase tracking-widest">Network Status</Text>
                </View>
                <Text className="text-xl text-white font-bold tracking-tight">Global Connectivity</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <MaterialIcons name="check-circle" size={16} color="#34d399" />
                  <Text className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Operational</Text>
                </View>
              </View>
              <View className="absolute top-6 right-6">
                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Current Node</Text>
                <Text className="text-white text-4xl font-bold">#142</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* XUM Judge Section */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">XUM Judge</Text>
            <TouchableOpacity onPress={() => onNavigate(ScreenName.TASK_MARKETPLACE)}>
              <Text className="text-xs font-bold text-primary uppercase tracking-widest">View more</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-4">
            {judgeTasks.map((task, i) => (
              <TouchableOpacity key={i} onPress={() => onNavigate(task.screen)} className="flex-row items-center p-5 rounded-3xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                  <MaterialIcons name={task.icon as any} size={24} color="#1349ec" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">{task.title}</Text>
                  <Text className="text-sm text-slate-500 mt-1">Linguistic Feedback Node</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-lg">{task.pay}</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+{task.reward}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Missions Section */}
        <View className="mt-8 px-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Daily Missions</Text>
            <TouchableOpacity onPress={() => onNavigate(ScreenName.TASK_MARKETPLACE)}>
              <Text className="text-xs font-bold text-primary uppercase tracking-widest">Browse all</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-4">
            {quickTasks.map((task) => (
              <TouchableOpacity key={task.id} onPress={() => onNavigate(ScreenName.TASK_DETAILS)} className="flex-row items-center p-5 rounded-3xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                <View className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
                  <MaterialIcons name={task.icon as any} size={24} color="#94a3b8" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm text-slate-900 dark:text-white uppercase">{task.title}</Text>
                  <View className="flex-row items-center gap-3 mt-2">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="schedule" size={12} color="#94a3b8" />
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.time}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="bolt" size={12} color="#10b981" />
                      <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{task.xp} XP</Text>
                    </View>
                  </View>
                </View>
                <Text className="text-lg font-bold text-primary">{task.reward}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav currentScreen={ScreenName.HOME} {...props} />
    </View>
  );
};

export const WalletScreen: React.FC<ScreenProps> = (props) => {
  const { onNavigate, balance, history } = props;

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Wallet" onBack={() => onNavigate(ScreenName.HOME)} />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Balance Card */}
        <View className="mt-6">
          <LinearGradient colors={['#1349ec', '#4338ca']} style={{ borderRadius: 40, padding: 32, overflow: 'hidden', position: 'relative', minHeight: 260, justifyContent: 'center' }}>
            <View className="absolute top-0 right-0 opacity-10">
              <MaterialIcons name="account-balance-wallet" size={140} color="white" />
            </View>
            <View className="relative z-10">
              <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</Text>
              <Text className="text-6xl font-bold text-white tracking-tighter">${balance?.toFixed(2)}</Text>
              <View className="flex-row gap-4 mt-8">
                <TouchableOpacity onPress={() => onNavigate(ScreenName.WITHDRAW)} className="flex-1 h-14 bg-white rounded-2xl items-center justify-center">
                  <Text className="text-slate-900 font-bold uppercase tracking-widest text-sm">Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity className="h-14 w-14 bg-white/20 rounded-2xl items-center justify-center border border-white/20">
                  <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Transaction History */}
        <View className="mt-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">Handshake History</Text>
          <View className="gap-4">
            {history?.map((item, i) => (
              <View key={i} className="flex-row items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
                    <MaterialIcons name={iconMap[item.icon] as any || 'payments'} size={24} color="#1349ec" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">{item.title}</Text>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold text-xl tracking-tighter ${item.type === 'withdraw' ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>{item.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav currentScreen={ScreenName.WALLET} {...props} />
    </View>
  );
};

export const LeaderboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const leaders = [
    { rank: 1, name: 'Elena S.', xp: 12450, avatar: 'ES' },
    { rank: 2, name: 'Marcus W.', xp: 11200, avatar: 'MW' },
    { rank: 3, name: 'Sarah K.', xp: 10800, avatar: 'SK' },
    { rank: 4, name: 'Alex R.', xp: 10450, avatar: 'AR' },
    { rank: 5, name: 'Jin P.', xp: 9800, avatar: 'JP' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Leaderboard" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Your Rank */}
        <View className="bg-primary/10 rounded-3xl p-8 my-6 border border-primary/20 items-center">
          <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Performance Protocol</Text>
          <Text className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">#142</Text>
          <Text className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">Global Percentile: Top 5%</Text>
        </View>

        {/* Leaders List */}
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Elite Nodes</Text>
        <View className="gap-4">
          {leaders.map((leader) => (
            <View key={leader.rank} className={`flex-row items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border ${leader.rank === 4 ? 'border-primary' : 'border-slate-100 dark:border-slate-800'}`}>
              <Text className={`w-10 text-center font-bold text-xl ${leader.rank <= 3 ? 'text-primary' : 'text-slate-400'}`}>#{leader.rank}</Text>
              <View className="w-14 h-14 rounded-2xl bg-slate-700 items-center justify-center">
                <Text className="text-white font-bold text-lg">{leader.avatar}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-lg">{leader.name}</Text>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{leader.xp} Accumulated XP</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const ProfileScreen: React.FC<ScreenProps> = ({ onNavigate, balance, profile }) => {
  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Profile" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar */}
        <View className="items-center py-8">
          <View className="relative">
            <View className="bg-slate-700 w-32 h-32 rounded-full items-center justify-center">
              <Text className="text-white text-4xl font-bold">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
              </Text>
            </View>
            <View className="absolute bottom-1 right-1 bg-primary rounded-full w-10 h-10 items-center justify-center border-4 border-white dark:border-background-dark">
              <Text className="text-white font-bold text-xs">L{profile?.level || 1}</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mt-4">{profile?.full_name || 'Anonymous Agent'}</Text>
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Contributor Node #{profile?.id?.slice(-4) || '0000'}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4">
          <View className="flex-1 bg-slate-50 dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-800 items-center">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Earnings</Text>
            <Text className="text-2xl font-bold text-primary">${balance?.toFixed(2)}</Text>
          </View>
          <View className="flex-1 bg-slate-50 dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-800 items-center">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Precision</Text>
            <Text className="text-2xl font-bold text-emerald-500">98.4%</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const WithdrawScreen: React.FC<ScreenProps> = ({ onNavigate, balance, onConfirm }) => {
  const [amount, setAmount] = useState(String(balance || 0));
  const [status, setStatus] = useState<'idle' | 'processing' | 'verifying' | 'success'>('idle');

  const startWithdraw = async () => {
    const numAmount = Number(amount);
    if (numAmount < 5.00) {
      alert("Minimum withdrawal threshold is $5.00");
      return;
    }
    if (numAmount > (balance || 0)) {
      alert("Insufficient liquidity in node balance.");
      return;
    }

    setStatus('processing');
    const result = await WalletService.requestWithdrawal(numAmount, 'paypal', { destination: 'User terminal' });

    if (result.status === 'success') {
      setStatus('verifying');
      setTimeout(() => {
        setStatus('success');
        onConfirm?.(numAmount, 'paypal');
      }, 2000);
    } else {
      setStatus('idle');
      alert(`Handshake Error: ${result.message}`);
    }
  };

  if (status !== 'idle') {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center p-8">
        {status === 'processing' && (
          <>
            <View className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary mb-6" />
            <Text className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mb-2">Processing</Text>
            <Text className="text-slate-500 font-bold text-sm uppercase tracking-widest">Initializing handshake protocol...</Text>
          </>
        )}
        {status === 'verifying' && (
          <>
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
              <MaterialIcons name="security" size={40} color="#1349ec" />
            </View>
            <Text className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mb-2">Verifying</Text>
            <Text className="text-slate-500 font-bold text-sm uppercase tracking-widest">Securing ledger entry...</Text>
          </>
        )}
        {status === 'success' && (
          <>
            <View className="w-32 h-32 rounded-full bg-emerald-500 items-center justify-center mb-8 shadow-lg">
              <MaterialIcons name="check-circle" size={64} color="white" />
            </View>
            <Text className="text-3xl font-bold uppercase tracking-tighter text-slate-900 dark:text-white mb-4">Complete</Text>
            <Text className="text-slate-500 mb-8 font-bold text-sm text-center">Funds have been dispatched to your linked paypal account.</Text>
            <TouchableOpacity onPress={() => onNavigate(ScreenName.WALLET)} className="w-full h-14 bg-primary rounded-2xl items-center justify-center">
              <Text className="text-white font-bold uppercase tracking-widest">Return to Terminal</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Withdrawal Portal" onBack={() => onNavigate(ScreenName.WALLET)} />
      <View className="flex-1 p-6">
        {/* Balance Display */}
        <View className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 items-center mb-8">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Liquidity Available</Text>
          <Text className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">${balance?.toFixed(2)}</Text>
        </View>

        {/* Amount Input */}
        <View>
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">Specify Amount</Text>
          <View className="relative">
            <Text className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-primary z-10">$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="w-full h-20 pl-14 pr-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl text-3xl font-bold text-slate-900 dark:text-white"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={startWithdraw} className="w-full h-16 bg-primary rounded-2xl items-center justify-center mt-8 shadow-lg">
          <Text className="text-white font-bold uppercase tracking-widest">Execute Transfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const SubmissionTrackerScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Submission Log" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="fact-check" size={64} color="#94a3b8" />
      <Text className="text-slate-500 text-center mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);

export const SettingsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  const SettingToggle = ({ label, subtitle, icon, value, onToggle }: any) => (
    <View className="flex-row items-center justify-between p-6 bg-slate-50 dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
      <View className="flex-row items-center gap-4">
        <MaterialIcons name={icon} size={24} color="#1349ec" />
        <View>
          <Text className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">{label}</Text>
          <Text className="text-[10px] text-slate-500 uppercase font-bold mt-1">{subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle} className={`w-14 h-8 rounded-full p-1 ${value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <View className={`w-6 h-6 rounded-full bg-white shadow-md ${value ? 'ml-6' : ''}`} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="System Config" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24 }}>
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Operational Controls</Text>
        <SettingToggle label="Push Protocols" subtitle="Incoming task alerts" icon="notifications" value={notifications} onToggle={() => setNotifications(!notifications)} />
        <SettingToggle label="Biometric Vault" subtitle="Fingerprint withdrawal" icon="fingerprint" value={biometrics} onToggle={() => setBiometrics(!biometrics)} />

        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2 mt-8">Network Utility</Text>
        <SettingToggle label="Low Bandwidth Mode" subtitle="Optimize media loading" icon="settings-ethernet" value={dataSaver} onToggle={() => setDataSaver(!dataSaver)} />
      </ScrollView>
    </View>
  );
};

export const NotificationsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const notifications = [
    { id: 1, title: 'Handshake Verified', body: 'Task #8291 has been accredited. $0.50 credited.', type: 'success', icon: 'verified', time: '2m ago' },
    { id: 2, title: 'Network Update', body: 'New High-Reward RLHF mission available in your region.', type: 'info', icon: 'bolt', time: '1h ago' },
    { id: 3, title: 'Payout Processed', body: 'Your withdrawal of $100.00 is now arriving.', type: 'finance', icon: 'payments', time: 'Yesterday' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Comms Hub" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24 }}>
        <View className="flex-row items-center justify-between px-2 mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Log</Text>
          <TouchableOpacity>
            <Text className="text-xs font-bold text-primary uppercase tracking-widest">Mark all read</Text>
          </TouchableOpacity>
        </View>
        <View className="gap-4">
          {notifications.map((notif) => (
            <TouchableOpacity key={notif.id} className="p-5 bg-slate-50 dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 flex-row gap-4">
              <View className={`w-12 h-12 rounded-xl items-center justify-center ${notif.type === 'success' ? 'bg-emerald-500/10' : notif.type === 'info' ? 'bg-primary/10' : 'bg-orange-500/10'}`}>
                <MaterialIcons name={notif.icon as any} size={24} color={notif.type === 'success' ? '#10b981' : notif.type === 'info' ? '#1349ec' : '#f97316'} />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white flex-1">{notif.title}</Text>
                  <Text className="text-[10px] font-bold text-slate-400">{notif.time}</Text>
                </View>
                <Text className="text-sm text-slate-500 dark:text-slate-400">{notif.body}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const SupportScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const faqs = [
    { q: "How are tasks accredited?", a: "Each contribution is cross-verified by 3 distinct network nodes to ensure semantic precision." },
    { q: "When can I withdraw?", a: "Once your internal ledger reaches a minimum of $10.00 verified funds." },
    { q: "What is RLHF?", a: "Reinforcement Learning from Human Feedback—guiding AI responses to be safer and more accurate." }
  ];

  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Support Labs" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24 }}>
        {/* Contact Card */}
        <View className="bg-primary rounded-3xl p-8 mb-8 overflow-hidden relative">
          <View className="absolute top-0 right-0 opacity-10">
            <MaterialIcons name="support-agent" size={100} color="white" />
          </View>
          <View className="relative z-10">
            <Text className="text-2xl font-bold text-white uppercase tracking-tighter mb-2">Request Assistance</Text>
            <Text className="text-white/80 font-bold text-sm mb-6">Our neural operators are standing by to resolve protocol interruptions.</Text>
            <TouchableOpacity className="h-12 px-6 bg-white rounded-2xl items-center justify-center self-start">
              <Text className="text-primary font-bold uppercase tracking-widest text-xs">Open Support Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Operational FAQ</Text>
        <View className="gap-3">
          {faqs.map((f, i) => (
            <TouchableOpacity key={i} onPress={() => setExpanded(expanded === i ? null : i)} className="bg-slate-50 dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <View className="flex-row items-center justify-between p-5">
                <Text className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white flex-1 pr-4">{f.q}</Text>
                <MaterialIcons name={expanded === i ? 'expand-less' : 'expand-more'} size={24} color="#94a3b8" />
              </View>
              {expanded === i && (
                <View className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
                  <Text className="text-sm text-slate-500 dark:text-slate-400 mt-3">{f.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View className="items-center pt-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol v4.0.2 Stable</Text>
          <Text className="text-[10px] text-slate-300 dark:text-slate-600 uppercase font-bold tracking-widest mt-1">Decentralized Intelligence Network</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export const ReferralScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Referrals" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="share" size={64} color="#94a3b8" />
      <Text className="text-slate-500 text-center mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);
