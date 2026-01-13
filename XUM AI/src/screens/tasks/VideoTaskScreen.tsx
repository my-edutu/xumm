import React, { useState } from 'react';
import ReactNative from 'react-native';
const {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions
} = ReactNative;
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTask } from '../../hooks/useTask';
import { MediaCapture } from '../../services/mediaCapture';
import { ScreenName } from '../../types';
import { createGlobalStyles, createCaptureStyles } from '../../styles';

interface VideoTaskScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

export const VideoTaskScreen: React.FC<VideoTaskScreenProps> = ({ onNavigate }) => {
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
    } = useTask({ taskType: 'video', tasksPerSession: 3 }); // Videos usually fewer tasks per session

    const [description, setDescription] = useState('');
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [fileSize, setFileSize] = useState<number>(0);

    // Handle video capture
    const handleCapture = async () => {
        const result = await MediaCapture.captureVideo(15); // max 15s

        if (result.success && result.uri) {
            setCapturedUri(result.uri);
            if (result.duration) setDuration(result.duration);
            if (result.size) setFileSize(result.size);
        } else if (result.error && result.error !== 'Recording cancelled') {
            Alert.alert('Error', result.error);
        }
    };

    // Handle task submission
    const handleSubmit = async () => {
        if (!capturedUri) return;

        const success = await submitTask(
            capturedUri,
            undefined,
            {
                description,
                durationSeconds: duration,
                fileSize
            }
        );

        if (success) {
            setDescription('');
            setCapturedUri(null);
            setDuration(0);
            setFileSize(0);
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
                        <MaterialIcons name="videocam" size={56} color="#fff" />
                    </View>
                    <Text style={{ fontSize: 28, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 16 }}>Excellent!</Text>
                    <Text style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 32 }}>You completed the video session</Text>
                    <Text style={{ fontSize: 40, fontWeight: '700', color: theme.success }}>${sessionReward.toFixed(2)}</Text>
                    <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 8 }}>Added to your wallet</Text>

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
                <Text style={[styles.headerTitle, { color: theme.text }]}>VIDEO TASK</Text>
                <TouchableOpacity onPress={skipPrompt} disabled={isSubmitting}>
                    <Text style={{ color: theme.primary, fontWeight: '600' }}>Skip</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
                {/* Progress */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Progress</Text>
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>{completedTasks}/3 video tasks</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: theme.surface, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: 8, backgroundColor: theme.primary, width: `${(completedTasks / 3) * 100}%` }} />
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
                            <Text style={{ color: theme.success, fontWeight: '600', fontSize: 12 }}>REWARD: ${currentPrompt.base_reward.toFixed(2)}</Text>
                        </View>
                    </View>
                )}

                {/* Capture Area */}
                {capturedUri ? (
                    <View style={{ marginTop: 24 }}>
                        <View style={{
                            width: '100%',
                            height: 250,
                            borderRadius: 16,
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            borderColor: theme.border,
                            borderWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <MaterialIcons name="play-circle-filled" size={64} color="#fff" />
                            <Text style={{ color: '#fff', marginTop: 8 }}>Video Recorded ({duration}s)</Text>

                            <TouchableOpacity
                                onPress={() => setCapturedUri(null)}
                                style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 4 }}
                            >
                                <MaterialIcons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 24 }}>
                            <Text style={{ color: theme.text, fontWeight: '600', marginBottom: 12 }}>Video Description</Text>
                            <TextInput
                                style={[captureStyles.translationInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                                placeholder="Briefly describe what happens in the video..."
                                placeholderTextColor={theme.textSecondary}
                                value={description}
                                onChangeText={setDescription}
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
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>SUBMIT VIDEO</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={handleCapture}
                            disabled={isSubmitting}
                            style={[captureStyles.recordButton, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.5 }]}
                        >
                            <MaterialIcons name="videocam" size={48} color="#fff" />
                        </TouchableOpacity>
                        <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: 14 }}>Tap to start video capture</Text>
                        <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>Max duration: 15 seconds</Text>
                    </View>
                )}

                {/* Reward Info */}
                <View style={[captureStyles.rewardInfo, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 40 }]}>
                    <MaterialIcons name="trending-up" size={24} color={theme.success} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Session Earnings</Text>
                        <Text style={{ color: theme.success, fontSize: 20, fontWeight: '700' }}>${sessionReward.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
