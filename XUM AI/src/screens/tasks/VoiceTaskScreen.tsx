import React, { useState, useEffect } from 'react';
import ReactNative from 'react-native';
const {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert
} = ReactNative;
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTask } from '../../hooks/useTask';
import { MediaCapture } from '../../services/mediaCapture';
import { ScreenName } from '../../types';
import { createGlobalStyles, createCaptureStyles } from '../../styles';

interface VoiceTaskScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

export const VoiceTaskScreen: React.FC<VoiceTaskScreenProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const styles = createGlobalStyles(theme);
    const captureStyles = createCaptureStyles(theme);
    const {
        currentPrompt,
        completedTasks,
        isLoading,
        isSubmitting,
        isRecording,
        showSuccess,
        sessionReward,
        error,
        startRecording,
        stopRecording,
        submitTask,
        skipPrompt,
        resetSession
    } = useTask({ taskType: 'voice', tasksPerSession: 5 });

    const [translation, setTranslation] = useState('');
    const [showTranslationInput, setShowTranslationInput] = useState(false);
    const [lastCheckResult, setLastCheckResult] = useState<any>(null);

    // Handle recording toggle
    const handleRecordToggle = async () => {
        if (isRecording) {
            const result = await MediaCapture.stopAudioRecording();
            stopRecording();

            if (result.success && result.uri) {
                setLastCheckResult(result);
                setShowTranslationInput(true);
            } else if (result.error) {
                Alert.alert('Error', result.error);
            }
        } else {
            const permission = await MediaCapture.requestAudioPermission();
            if (permission.granted) {
                const started = await MediaCapture.startAudioRecording();
                if (started) {
                    startRecording();
                    setShowTranslationInput(false);
                } else {
                    Alert.alert('Error', 'Failed to start recording');
                }
            } else {
                Alert.alert('Permission Denied', 'Microphone access is required for this task.');
            }
        }
    };

    // Handle task submission
    const handleSubmit = async () => {
        if (!lastCheckResult?.uri) return;

        const success = await submitTask(
            lastCheckResult.uri,
            translation,
            {
                durationSeconds: lastCheckResult.duration,
                fileSize: lastCheckResult.size
            }
        );

        if (success) {
            setTranslation('');
            setShowTranslationInput(false);
            setLastCheckResult(null);
        } else if (error) {
            Alert.alert('Submission Failed', error);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.screenContainer, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading tasks...</Text>
            </View>
        );
    }

    if (showSuccess) {
        return (
            <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => onNavigate('ENVIRONMENTAL_SENSING' as ScreenName)}>
                        <MaterialIcons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>COMPLETE</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.success, justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
                        <MaterialIcons name="check" size={56} color="#fff" />
                    </View>
                    <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 16 }}>Great Job!</Text>
                    <Text style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 32 }}>You completed 5 voice recordings</Text>
                    <Text style={{ fontSize: 40, fontWeight: '700', color: theme.success }}>${sessionReward.toFixed(2)}</Text>
                    <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 8 }}>Earned this session</Text>

                    <TouchableOpacity
                        style={{ marginTop: 48, backgroundColor: theme.primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 }}
                        onPress={() => onNavigate('ENVIRONMENTAL_SENSING' as ScreenName)}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>CONTINUE EARNING</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => onNavigate('ENVIRONMENTAL_SENSING' as ScreenName)}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>VOICE TASK</Text>
                <TouchableOpacity onPress={skipPrompt} disabled={isSubmitting || isRecording}>
                    <Text style={{ color: theme.primary, fontWeight: '600' }}>Skip</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
                {/* Progress */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Progress</Text>
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>{completedTasks}/5 tasks</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: theme.surface, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: 8, backgroundColor: theme.primary, width: `${(completedTasks / 5) * 100}%` }} />
                    </View>
                </View>

                {/* Prompt Card */}
                {currentPrompt && (
                    <View style={[captureStyles.promptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[captureStyles.promptBadge, { backgroundColor: `${theme.primary}20` }]}>
                            <Text style={[captureStyles.promptBadgeText, { color: theme.primary }]}>{currentPrompt.category}</Text>
                        </View>
                        <Text style={[captureStyles.promptText, { color: theme.text }]}>{currentPrompt.prompt_text}</Text>
                        {currentPrompt.hint_text && (
                            <Text style={[captureStyles.promptHint, { color: theme.textSecondary }]}>{currentPrompt.hint_text}</Text>
                        )}
                        <View style={{ flexDirection: 'row', marginTop: 12 }}>
                            <Text style={{ color: theme.success, fontWeight: '600', fontSize: 12 }}>BASE: ${currentPrompt.base_reward.toFixed(2)}</Text>
                            {currentPrompt.bonus_reward > 0 && (
                                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 12, marginLeft: 12 }}>BONUS: +${currentPrompt.bonus_reward.toFixed(2)}</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Record Button */}
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <TouchableOpacity
                        onPress={handleRecordToggle}
                        disabled={isSubmitting}
                        style={[
                            captureStyles.recordButton,
                            { backgroundColor: isRecording ? '#f43f5e' : theme.primary },
                            isSubmitting && { opacity: 0.5 }
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <MaterialIcons name={isRecording ? 'stop' : 'mic'} size={48} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: 14 }}>
                        {isSubmitting ? 'Uploading...' : isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                    </Text>
                </View>

                {/* Translation Input */}
                {showTranslationInput && !isRecording && (
                    <View style={{ marginTop: 32 }}>
                        <Text style={{ color: theme.text, fontWeight: '600', marginBottom: 12 }}>
                            Add English Translation (Bonus +${currentPrompt?.bonus_reward.toFixed(2)})
                        </Text>
                        <TextInput
                            style={[captureStyles.translationInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                            placeholder="Type the English meaning here..."
                            placeholderTextColor={theme.textSecondary}
                            value={translation}
                            onChangeText={setTranslation}
                            multiline
                        />
                        <TouchableOpacity
                            style={[captureStyles.submitButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>SUBMIT RECORDING</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reward Info */}
                <View style={[captureStyles.rewardInfo, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 40 }]}>
                    <MaterialIcons name="account-balance-wallet" size={24} color={theme.success} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Session Earnings</Text>
                        <Text style={{ color: theme.success, fontSize: 20, fontWeight: '700' }}>${sessionReward.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
