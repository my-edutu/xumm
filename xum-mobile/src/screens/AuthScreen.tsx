import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function AuthScreen({ navigation }: Props) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigation.replace('Home');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName || 'New User' },
                    },
                });
                if (error) throw error;
                Alert.alert('Success', 'Check your email to verify your account');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // PROTOTYPE MODE: Skip auth for demo
    const handleSkipAuth = () => {
        navigation.replace('Home');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>X</Text>
                </View>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join XUM'}</Text>
                <Text style={styles.subtitle}>
                    {isLogin ? 'Sign in to continue' : 'Create your account'}
                </Text>
            </View>

            <View style={styles.form}>
                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#64748b"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsLogin(!isLogin)}
                >
                    <Text style={styles.switchText}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <Text style={styles.switchTextBold}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </Text>
                    </Text>
                </TouchableOpacity>

                {/* PROTOTYPE MODE */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkipAuth}>
                    <Text style={styles.skipText}>Skip for Demo →</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: '#334155',
    },
    button: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    switchButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    switchText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    switchTextBold: {
        color: '#f97316',
        fontWeight: '600',
    },
    skipButton: {
        alignItems: 'center',
        marginTop: 24,
        padding: 12,
        backgroundColor: '#1e293b',
        borderRadius: 12,
    },
    skipText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
});
