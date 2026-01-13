import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to Auth after 2.5 seconds
        const timer = setTimeout(() => {
            navigation.replace('Auth');
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>X</Text>
                </View>
                <Text style={styles.title}>XUM AI</Text>
                <Text style={styles.subtitle}>Human Intelligence Platform</Text>
            </Animated.View>

            <Text style={styles.version}>v1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    logoText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#ffffff',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 8,
        fontWeight: '500',
    },
    version: {
        position: 'absolute',
        bottom: 40,
        color: '#475569',
        fontSize: 12,
    },
});
