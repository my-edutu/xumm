import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenName } from '../types';
import { supabase } from '../supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

interface ScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

// ============================================================================
// SPLASH SCREEN
// ============================================================================

/**
 * Logo coordinate map for particle animation
 * Particles will gather towards these points, then fade into solid text.
 */
const LOGO_MAP = [
  // X
  { x: 10, y: 30 }, { x: 15, y: 35 }, { x: 20, y: 40 }, { x: 25, y: 45 }, { x: 30, y: 50 }, { x: 35, y: 55 }, { x: 40, y: 60 },
  { x: 40, y: 30 }, { x: 35, y: 35 }, { x: 30, y: 40 }, { x: 20, y: 50 }, { x: 15, y: 55 }, { x: 10, y: 60 },
  // U
  { x: 50, y: 30 }, { x: 50, y: 35 }, { x: 50, y: 40 }, { x: 50, y: 45 }, { x: 50, y: 50 }, { x: 55, y: 55 }, { x: 60, y: 60 }, { x: 65, y: 60 }, { x: 70, y: 55 }, { x: 75, y: 50 }, { x: 75, y: 45 }, { x: 75, y: 40 }, { x: 75, y: 35 }, { x: 75, y: 30 },
  // M
  { x: 85, y: 60 }, { x: 85, y: 55 }, { x: 85, y: 50 }, { x: 85, y: 45 }, { x: 85, y: 40 }, { x: 85, y: 35 }, { x: 85, y: 30 },
  { x: 90, y: 35 }, { x: 95, y: 40 }, { x: 100, y: 45 }, { x: 105, y: 40 }, { x: 110, y: 35 },
  { x: 115, y: 30 }, { x: 115, y: 35 }, { x: 115, y: 40 }, { x: 115, y: 45 }, { x: 115, y: 50 }, { x: 115, y: 55 }, { x: 115, y: 60 },
  // A
  { x: 135, y: 60 }, { x: 135, y: 55 }, { x: 135, y: 50 }, { x: 135, y: 45 }, { x: 140, y: 40 }, { x: 145, y: 35 }, { x: 150, y: 30 }, { x: 155, y: 35 }, { x: 160, y: 40 }, { x: 165, y: 45 }, { x: 165, y: 50 }, { x: 165, y: 55 }, { x: 165, y: 60 },
  { x: 142, y: 48 }, { x: 148, y: 48 }, { x: 154, y: 48 }, { x: 160, y: 48 },
  // I
  { x: 175, y: 30 }, { x: 180, y: 30 }, { x: 185, y: 30 },
  { x: 180, y: 35 }, { x: 180, y: 40 }, { x: 180, y: 45 }, { x: 180, y: 50 }, { x: 180, y: 55 },
  { x: 175, y: 60 }, { x: 180, y: 60 }, { x: 185, y: 60 },
];

export const SplashScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<'scattered' | 'forming' | 'stable'>('scattered');

  const particles = useMemo(() => {
    return Array.from({ length: 800 }).map((_, i) => {
      const targetPoint = LOGO_MAP[i % LOGO_MAP.length];
      const scale = 0.28;
      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1.5;

      return {
        id: i,
        size: Math.random() * 2 + 1,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        targetX: 50 + (targetPoint.x - 100) * scale + jitterX,
        targetY: 48 + (targetPoint.y - 45) * scale + jitterY,
        delay: Math.random() * 1200,
        duration: 2200 + Math.random() * 1800,
      };
    });
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('forming'), 1200);
    const timer2 = setTimeout(() => setPhase('stable'), 5200);
    const timer3 = setTimeout(() => onNavigate(ScreenName.ONBOARDING), 8200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onNavigate]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="relative flex-1 w-full bg-[#0a0d1d] items-center justify-center overflow-hidden"
      onPress={() => onNavigate(ScreenName.ONBOARDING)}
    >
      <View className="absolute inset-0 w-full h-full bg-[#0a0d1d]" />

      {/* Glow Effect */}
      <View className="absolute inset-0 opacity-20" pointerEvents="none">
        <View className="absolute top-1/2 left-1/2 -ml-[80%] -mt-[80%] w-[160%] h-[160%] bg-white/5 rounded-full" />
      </View>

      {/* Solid Logo Text */}
      <View className={`relative z-30 transform ${phase === 'stable' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <Text className="text-5xl font-black text-white tracking-tighter uppercase text-center shadow-lg">
          XUM AI
        </Text>
      </View>

      {/* Particle Animation */}
      <View className={`absolute inset-0 z-20 ${phase === 'stable' ? 'opacity-0' : 'opacity-100'}`} pointerEvents="none">
        {particles.map((p) => {
          const isTarget = phase !== 'scattered';
          return (
            <View
              key={p.id}
              className="absolute rounded-full bg-white shadow-sm"
              style={{
                width: p.size,
                height: p.size,
                left: `${isTarget ? p.targetX : p.initialX}%`,
                top: `${isTarget ? p.targetY : p.initialY}%`,
                opacity: phase === 'forming' ? 0.6 : 0.35,
                transform: [{ scale: phase === 'forming' ? 1.1 : 1 }],
              }}
            />
          );
        })}
      </View>

      <View className="absolute inset-0 opacity-10 bg-black" pointerEvents="none" />
    </TouchableOpacity>
  );
};

// ============================================================================
// ONBOARDING SCREEN
// ============================================================================

interface OnboardingSlide {
  title: React.ReactNode;
  body: string;
  cta: string;
  colors: string[];
  icons: Array<{
    icon: string;
    color: string;
    label: string;
    value: string;
    pos: string;
    rot: string;
  }>;
}

export const OnboardingScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const slides: OnboardingSlide[] = [
    {
      title: (<Text>Welcome to <Text className="font-normal text-white/90">XUM AI</Text></Text>),
      body: "Earn by helping train the next generation of AI — using your voice, language, and judgment.",
      cta: "Get Started",
      colors: ['#1349ec', '#10b981', '#0a0d1d'],
      icons: [
        { icon: 'mic', color: 'bg-emerald-500', label: 'Voice Labeler', value: '+$0.45/min', pos: 'top-0 right-0', rot: '6deg' },
        { icon: 'verified', color: 'bg-blue-500', label: 'RLHF Auditor', value: '+$1.20/task', pos: 'bottom-4 left-0', rot: '-3deg' },
      ],
    },
    {
      title: "Simple Tasks. Real Money.",
      body: "Contribute by recording voice, labeling text or images, validating answers, or judging AI responses.",
      cta: "Next",
      colors: ['#4f46e5', '#a855f7', '#0a0d1d'],
      icons: [
        { icon: 'edit-note', color: 'bg-purple-500', label: 'Text Editor', value: '+$0.15/msg', pos: 'top-2 left-4', rot: '-6deg' },
        { icon: 'image-search', color: 'bg-pink-500', label: 'Image Tagger', value: '+$0.80/task', pos: 'bottom-8 right-0', rot: '12deg' },
      ],
    },
    {
      title: "Your Data Trains Smarter AI",
      body: "Your language, culture, and decisions help AI understand the world better — more accurately and fairly.",
      cta: "Next",
      colors: ['#0d9488', '#1349ec', '#0a0d1d'],
      icons: [
        { icon: 'psychology', color: 'bg-cyan-500', label: 'Logic Trainer', value: 'Level Up', pos: 'top-10 right-4', rot: '12deg' },
        { icon: 'public', color: 'bg-emerald-500', label: 'Global Impact', value: 'Active', pos: 'bottom-0 left-8', rot: '-12deg' },
      ],
    },
    {
      title: "Fair Pay. Full Control.",
      body: "Track your earnings in real time, withdraw anytime, and work only on tasks you qualify for.",
      cta: "Finish",
      colors: ['#1349ec', '#4338ca', '#0a0d1d'],
      icons: [
        { icon: 'payments', color: 'bg-green-500', label: 'Instant Pay', value: 'Withdraw', pos: 'top-0 left-0', rot: '-12deg' },
        { icon: 'shield', color: 'bg-blue-500', label: 'Privacy Core', value: 'Secured', pos: 'bottom-4 right-4', rot: '6deg' },
      ],
    },
  ];

  const nextStep = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else if (agreed) {
      onNavigate(ScreenName.AUTH);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = slides[step];

  return (
    <LinearGradient colors={current.colors as [string, string, ...string[]]} style={{ position: 'relative', flex: 1, width: '100%', backgroundColor: '#0a0d1d' }}>
      <View className="flex-1 pt-12">
        {/* Header Navigation */}
        <View className="px-8 z-30">
          <View className="flex-row justify-between items-center h-8 mb-6">
            <TouchableOpacity onPress={prevStep} className={`p-2 -ml-2 ${step === 0 ? 'opacity-0' : 'opacity-100'}`}>
              <MaterialIcons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate(ScreenName.AUTH)}>
              <Text className="text-white/60 text-xs font-black uppercase tracking-[2px]">Skip</Text>
            </TouchableOpacity>
          </View>
          {/* Progress Indicators */}
          <View className="flex-row gap-2">
            {slides.map((_, i) => (
              <View key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-1 justify-end px-8 pb-4">
          {/* Floating Icons */}
          <View className="h-44 w-full mb-8 relative">
            {current.icons.map((item, idx) => (
              <View
                key={idx}
                className={`absolute bg-white/10 p-4 rounded-3xl border border-white/20 ${item.pos}`}
                style={{ transform: [{ rotate: item.rot }] }}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-xl ${item.color}/20 items-center justify-center`}>
                    <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color="white" />
                  </View>
                  <View>
                    <Text className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{item.label}</Text>
                    <Text className="text-sm font-bold text-white">{item.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Main Text */}
          <View className="mb-6">
            <Text className="text-5xl font-bold text-white leading-tight -tracking-[1px]">{current.title}</Text>
            <Text className="text-2xl font-medium text-white/90 mt-4 leading-snug">{current.body}</Text>
          </View>

          {/* Terms Agreement (Last Step Only) */}
          {step === 3 && (
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              className="flex-row gap-4 items-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-4"
            >
              <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${agreed ? 'bg-cyan-400 border-cyan-400' : 'border-white/20'}`}>
                {agreed && <MaterialIcons name="check" size={16} color="black" />}
              </View>
              <Text className="text-[11px] text-white/60 font-bold uppercase tracking-wider flex-1">
                I agree to the Terms and Privacy Policy.
              </Text>
            </TouchableOpacity>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={nextStep}
            disabled={step === 3 && !agreed}
            className={`w-full h-14 bg-white rounded-2xl items-center justify-center flex-row gap-3 mb-10 ${step === 3 && !agreed ? 'opacity-20' : 'opacity-100'}`}
          >
            <Text className="text-base font-semibold text-black uppercase tracking-tight">{current.cta}</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

// ============================================================================
// AUTH SCREEN (Login / Sign Up)
// ============================================================================

export const AuthScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'Login' | 'SignUp'>('Login');
  const [authMethod, setAuthMethod] = useState<'password' | 'magiclink'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'SignUp') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, age: parseInt(age), role: 'worker' } },
        });
        if (signUpError) throw signUpError;
        alert('Verification email sent!');
        setMode('Login');
      } else {
        if (authMethod === 'magiclink') {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: Platform.OS === 'web' ? window.location.origin : 'xum://auth-callback',
            }
          });
          if (otpError) throw otpError;
          alert('Magic Link sent to your email!');
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          onNavigate(ScreenName.HOME);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#0a0d1d]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header Gradient */}
        <LinearGradient colors={['rgba(19, 73, 236, 0.4)', 'transparent']} style={{ height: 224, position: 'relative', width: '100%' }}>
          <View className="flex-1 justify-end p-8 pb-8">
            <TouchableOpacity onPress={() => onNavigate(ScreenName.ONBOARDING)} className="absolute top-12 left-6">
              <MaterialIcons name="arrow-back" size={28} color="#ffffff66" />
            </TouchableOpacity>
            <Text className="text-white text-4xl font-bold tracking-tighter mb-2">
              XUM AI<Text className="text-cyan-400">.</Text>
            </Text>
            <Text className="text-white/40 text-sm font-semibold uppercase tracking-[2px]">Contributor Terminal</Text>
          </View>
        </LinearGradient>

        <View className="px-8 pt-4 pb-10">
          {/* Mode Toggle (Login / SignUp) */}
          <View className="flex-row h-12 bg-white/5 rounded-2xl p-1 border border-white/10 mb-6">
            <TouchableOpacity
              onPress={() => setMode('Login')}
              className={`flex-1 items-center justify-center rounded-xl ${mode === 'Login' ? 'bg-white' : ''}`}
            >
              <Text className={`font-bold text-xs uppercase tracking-widest ${mode === 'Login' ? 'text-black' : 'text-white/40'}`}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('SignUp')}
              className={`flex-1 items-center justify-center rounded-xl ${mode === 'SignUp' ? 'bg-white' : ''}`}
            >
              <Text className={`font-bold text-xs uppercase tracking-widest ${mode === 'SignUp' ? 'text-black' : 'text-white/40'}`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auth Method Toggle (ONLY FOR LOGIN) */}
          {mode === 'Login' && (
            <View className="flex-row justify-center mb-8 gap-6">
              <TouchableOpacity
                onPress={() => setAuthMethod('password')}
                className="items-center"
              >
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${authMethod === 'password' ? 'text-cyan-400' : 'text-white/30'}`}>
                  Access Key
                </Text>
                {authMethod === 'password' && <View className="h-1 w-4 bg-cyan-400 rounded-full mt-1" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAuthMethod('magiclink')}
                className="items-center"
              >
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${authMethod === 'magiclink' ? 'text-cyan-400' : 'text-white/30'}`}>
                  Magic Link
                </Text>
                {authMethod === 'magiclink' && <View className="h-1 w-4 bg-cyan-400 rounded-full mt-1" />}
              </TouchableOpacity>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <Text className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View className="gap-5">
            {mode === 'SignUp' && (
              <>
                <View>
                  <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">Identity: Full Name</Text>
                  <View className="relative justify-center">
                    <MaterialIcons name="person-outline" size={20} color="#ffffff33" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
                    <TextInput
                      className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-medium"
                      placeholder="Enter Full Name"
                      placeholderTextColor="#ffffff33"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">Biological Age</Text>
                  <View className="relative justify-center">
                    <MaterialIcons name="event" size={20} color="#ffffff33" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
                    <TextInput
                      className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-medium"
                      placeholder="Enter Age"
                      placeholderTextColor="#ffffff33"
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>
                </View>
              </>
            )}

            <View>
              <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">Terminal ID (Email)</Text>
              <View className="relative justify-center">
                <MaterialIcons name="alternate-email" size={20} color="#ffffff33" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
                <TextInput
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-medium"
                  placeholder="name@domain.com"
                  placeholderTextColor="#ffffff33"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {(mode === 'SignUp' || (mode === 'Login' && authMethod === 'password')) && (
              <View>
                <Text className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1 mb-2">Access Key (Password)</Text>
                <View className="relative justify-center">
                  <MaterialIcons name="lock-open" size={20} color="#ffffff33" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
                  <TextInput
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-12 text-white font-medium"
                    placeholder="••••••••"
                    placeholderTextColor="#ffffff33"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16 }}>
                    <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#ffffff4d" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              className="w-full h-14 bg-white rounded-2xl items-center justify-center mt-4 shadow-lg shadow-white/10"
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-black font-bold uppercase tracking-widest">
                {loading ? 'Processing...' :
                  mode === 'SignUp' ? 'Register Account' :
                    authMethod === 'magiclink' ? 'Transmit Magic Link' : 'Secure Log In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switch Link */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              {mode === 'Login' ? 'Unauthorized?' : 'Already active?'}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'Login' ? 'SignUp' : 'Login')}>
              <Text className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest ml-2">
                {mode === 'Login' ? 'Request Access' : 'Log In Instead'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// FORGOT PASSWORD SCREEN (Refactored to React Native)
// ============================================================================

export const ForgotPasswordScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      onNavigate(ScreenName.OTP_VERIFICATION);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0d1d]">
      {/* Header */}
      <LinearGradient colors={['rgba(6, 182, 212, 0.2)', 'transparent']} style={{ height: 192, position: 'relative' }}>
        <View className="flex-1 justify-end p-8">
          <TouchableOpacity
            onPress={() => onNavigate(ScreenName.AUTH)}
            className="absolute top-12 left-6"
          >
            <MaterialIcons name="arrow-back" size={28} color="#ffffff66" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
            Access Recovery
          </Text>
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase">
            Let's get you back to earning
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 p-8 justify-center">
        <Text className="text-sm font-medium text-white/60 leading-relaxed mb-6">
          Forgot your password? Enter your email below and we'll send a 4-digit verification code to your terminal.
        </Text>

        <View className="mb-6">
          <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">
            Terminal ID (Email)
          </Text>
          <View className="relative justify-center">
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#ffffff33"
              style={{ position: 'absolute', left: 16, zIndex: 10 }}
            />
            <TextInput
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 pl-12 pr-4 text-white font-medium"
              placeholder="name@domain.com"
              placeholderTextColor="#ffffff1a"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="w-full h-16 bg-white rounded-2xl items-center justify-center shadow-xl"
        >
          <Text className="text-black font-black text-sm uppercase tracking-widest">
            {loading ? 'Sending...' : 'Request Reset Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// OTP VERIFICATION SCREEN (Refactored to React Native)
// ============================================================================

export const OTPScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(59);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 4) {
      alert('Please enter the complete 4-digit code');
      return;
    }
    // TODO: Verify the OTP with Supabase
    onNavigate(ScreenName.HOME);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(59);
    // TODO: Resend OTP
    alert('New code sent!');
  };

  return (
    <View className="flex-1 bg-[#0a0d1d]">
      {/* Header */}
      <LinearGradient colors={['rgba(6, 182, 212, 0.2)', 'transparent']} style={{ height: 192, position: 'relative' }}>
        <View className="flex-1 justify-end p-8">
          <TouchableOpacity
            onPress={() => onNavigate(ScreenName.FORGOT_PASSWORD)}
            className="absolute top-12 left-6"
          >
            <MaterialIcons name="arrow-back" size={28} color="#ffffff66" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
            Verify Identity
          </Text>
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase">
            Enter the validation sequence
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 p-8 items-center justify-center">
        <Text className="text-sm font-medium text-white/60 leading-relaxed mb-8 text-center">
          Enter the 4-digit code we just sent to your inbox.
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row gap-4 justify-center mb-10">
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black text-cyan-400"
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleChange(val, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-4">
          <TouchableOpacity
            onPress={handleVerify}
            className="w-full h-16 bg-white rounded-2xl items-center justify-center shadow-xl"
          >
            <Text className="text-black font-black text-sm uppercase tracking-widest">
              Verify & Access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0}
            className="w-full items-center"
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${countdown > 0 ? 'text-white/30' : 'text-white'}`}>
              {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
