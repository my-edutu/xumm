import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { ScreenName } from '../types';
import { supabase } from '../supabaseClient';

interface EditProfileScreenProps {
    onNavigate: (screen: any) => void;
    onBack: () => void;
    session: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onNavigate, onBack, session }) => {
    const { theme } = useTheme();
    const [fullName, setFullName] = useState(session?.user?.fullName || '');
    const [loading, setLoading] = useState(false);

    // This is a placeholder since Clerk handles the actual profile update
    // In a real app we might update metadata or trigger a Clerk flow
    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate update
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert("Success", "Profile updated successfully!");
            onBack();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>EDIT PROFILE</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text style={{ color: theme.primary, fontWeight: '700' }}>
                        {loading ? 'SAVING...' : 'SAVE'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: session?.user?.imageUrl || 'https://i.pravatar.cc/150?u=' + session?.user?.id }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                            <MaterialIcons name="camera-alt" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>
                        Tap to change profile picture
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>FULL NAME</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                                color: theme.text
                            }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                                color: theme.textSecondary,
                                opacity: 0.7
                            }]}
                            value={session?.user?.primaryEmailAddress?.emailAddress}
                            editable={false}
                        />
                        <Text style={[styles.hint, { color: theme.textSecondary }]}>
                            Email cannot be changed directly.
                        </Text>
                    </View>
                </View>
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
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    avatarHint: {
        fontSize: 12,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    hint: {
        fontSize: 11,
        marginTop: 4,
    }
});
