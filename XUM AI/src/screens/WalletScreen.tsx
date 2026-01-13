import React, { useState } from 'react';
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
import { TaskService, Transaction } from '../services/taskService';
import { ScreenName } from '../types';
import { createGlobalStyles, createWalletStyles } from '../styles';

interface WalletScreenProps {
    onNavigate: (s: ScreenName) => void;
    onBack?: () => void;
    balance: number;
    transactions: Transaction[];
    onOpenContributorHub: () => void;
    onOpenNeuralInput: () => void;
    session: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
    onNavigate,
    onBack,
    balance,
    transactions,
    onOpenContributorHub,
    onOpenNeuralInput,
    session
}) => {
    const { theme } = useTheme();
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const styles = createGlobalStyles(theme);
    const walletStyles = createWalletStyles(theme);

    const handleWithdrawal = async () => {
        if (balance <= 0) {
            alert("No balance available to withdraw.");
            return;
        }

        setIsWithdrawing(true);
        const result = await TaskService.requestWithdrawal(
            session.user.id,
            balance,
            'PayPal',
            session.user.email
        );

        setIsWithdrawing(false);

        if (result.success) {
            alert("Withdrawal request submitted successfully!");
        } else {
            alert("Error submitting withdrawal: " + result.error);
        }
    };

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onBack ? onBack() : onNavigate(ScreenName.HOME)}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>WALLET</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
                <LinearGradient colors={[theme.primary, theme.primaryDark]} style={walletStyles.balanceCardRedesign}>
                    <Text style={walletStyles.balanceLabelRedesign}>AVAILABLE BALANCE</Text>
                    <Text style={walletStyles.balanceValueRedesign}>${balance.toFixed(2)}</Text>

                    <View style={walletStyles.balanceActionsRedesign}>
                        <TouchableOpacity
                            style={[walletStyles.withdrawButtonRedesign, isWithdrawing && { opacity: 0.7 }]}
                            onPress={handleWithdrawal}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={walletStyles.withdrawTextRedesign}>WITHDRAW</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[walletStyles.addFundsButtonRedesign, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                            onPress={onOpenContributorHub}
                        >
                            <MaterialIcons name="history" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={walletStyles.cardIconRedesign}>
                        <MaterialIcons name="account-balance-wallet" size={120} color="rgba(255,255,255,0.1)" />
                    </View>
                </LinearGradient>

                <Text style={[walletStyles.historyTitleRedesign, { color: theme.text }]}>HISTORY</Text>

                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <View key={tx.id} style={[walletStyles.historyItemRedesign, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[walletStyles.historyIconBoxRedesign, { backgroundColor: `${theme.primary}15` }]}>
                                <MaterialIcons
                                    name={tx.type === 'earn' ? 'image' : tx.type === 'withdraw' ? 'north-east' : 'verified'}
                                    size={20}
                                    color={theme.primary}
                                />
                            </View>
                            <View style={walletStyles.historyInfoRedesign}>
                                <Text style={[walletStyles.historyTitleTextRedesign, { color: theme.text }]}>{tx.description.toUpperCase()}</Text>
                                <Text style={walletStyles.historyDateRedesign}>{new Date(tx.created_at).toLocaleDateString().toUpperCase()}</Text>
                            </View>
                            <Text style={[
                                walletStyles.historyAmountRedesign,
                                tx.type === 'earn' || tx.type === 'bonus' ? { color: theme.success } : { color: theme.text }
                            ]}>
                                {tx.type === 'earn' || tx.type === 'bonus' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary }}>No transactions yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
