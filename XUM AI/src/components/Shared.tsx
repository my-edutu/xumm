import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenName, Theme } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  activeThemeId?: string;
  setActiveThemeId?: (id: string) => void;
  themes?: Theme[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  isDarkMode,
  setIsDarkMode,
  activeThemeId,
  setActiveThemeId,
  themes = []
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false);
  const [extrasView, setExtrasView] = useState<'main' | 'themes'>('main');

  const toggleMode = () => {
    if (setIsDarkMode) setIsDarkMode(!isDarkMode);
  };

  const isActive = (screen: ScreenName) => currentScreen === screen;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pb-6 z-50 shadow-lg">
        <View className="flex-row justify-around items-center h-16 px-4">
          <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)} className="flex-1 items-center justify-center h-full">
            <MaterialIcons name="home" size={24} color={isActive(ScreenName.HOME) ? '#1349ec' : '#94a3b8'} />
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isActive(ScreenName.HOME) ? 'text-primary' : 'text-slate-400'}`}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onNavigate(ScreenName.TASK_MARKETPLACE)} className="flex-1 items-center justify-center h-full">
            <MaterialIcons name="explore" size={24} color={isActive(ScreenName.TASK_MARKETPLACE) ? '#1349ec' : '#94a3b8'} />
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isActive(ScreenName.TASK_MARKETPLACE) ? 'text-primary' : 'text-slate-400'}`}>Task</Text>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center -mt-8">
            <TouchableOpacity onPress={() => setIsCreateMenuOpen(true)} className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-xl border-4 border-white dark:border-surface-dark">
              <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onNavigate(ScreenName.WALLET)} className="flex-1 items-center justify-center h-full">
            <MaterialIcons name="account-balance-wallet" size={24} color={isActive(ScreenName.WALLET) ? '#1349ec' : '#94a3b8'} />
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isActive(ScreenName.WALLET) ? 'text-primary' : 'text-slate-400'}`}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsExtrasMenuOpen(true); setExtrasView('main'); }} className="flex-1 items-center justify-center h-full">
            <MaterialIcons name="menu" size={24} color={isExtrasMenuOpen ? '#1349ec' : '#94a3b8'} />
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isExtrasMenuOpen ? 'text-primary' : 'text-slate-400'}`}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Extras Menu Modal */}
      <Modal visible={isExtrasMenuOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/80" onPress={() => setIsExtrasMenuOpen(false)} />
          <View className="bg-white dark:bg-background-dark rounded-t-3xl p-6 pb-12 max-h-[85%]">
            <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

            {extrasView === 'main' ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Contributor Hub</Text>
                  <TouchableOpacity onPress={() => setIsExtrasMenuOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                    <MaterialIcons name="close" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-4 mb-6">
                  {[
                    { label: 'Profile', icon: 'person', screen: ScreenName.PROFILE, color: '#3b82f6' },
                    { label: 'Wallet', icon: 'account-balance-wallet', screen: ScreenName.WALLET, color: '#10b981' },
                    { label: 'Comms', icon: 'notifications', screen: ScreenName.NOTIFICATIONS, color: '#f97316' },
                    { label: 'Ranking', icon: 'military-tech', screen: ScreenName.LEADERBOARD, color: '#a855f7' },
                  ].map((item) => (
                    <TouchableOpacity key={item.label} onPress={() => { setIsExtrasMenuOpen(false); onNavigate(item.screen); }} className="w-[47%] items-center p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                      <View className="w-14 h-14 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: item.color }}>
                        <MaterialIcons name={item.icon as any} size={28} color="white" />
                      </View>
                      <Text className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="gap-3">
                  <TouchableOpacity onPress={() => setExtrasView('themes')} className="flex-row items-center p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-4">
                      <MaterialIcons name="palette" size={20} color="#1349ec" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Theme</Text>
                      <Text className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{themes.find(t => t.id === activeThemeId)?.name} Mode</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setIsExtrasMenuOpen(false); onNavigate(ScreenName.SETTINGS); }} className="flex-row items-center p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                    <View className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
                      <MaterialIcons name="settings" size={20} color="#94a3b8" />
                    </View>
                    <Text className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setIsExtrasMenuOpen(false); onNavigate(ScreenName.SUPPORT); }} className="flex-row items-center p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                    <View className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
                      <MaterialIcons name="help-center" size={20} color="#94a3b8" />
                    </View>
                    <Text className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Support</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => { setIsExtrasMenuOpen(false); onNavigate(ScreenName.AUTH); }} className="flex-row items-center justify-center h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mt-6">
                  <MaterialIcons name="logout" size={20} color="#ef4444" />
                  <Text className="text-red-500 font-bold uppercase tracking-widest text-sm ml-3">Terminate Session</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center gap-4 mb-6">
                  <TouchableOpacity onPress={() => setExtrasView('main')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                    <MaterialIcons name="arrow-back" size={20} color="#64748b" />
                  </TouchableOpacity>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Appearance Labs</Text>
                </View>

                <View className="flex-row items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800 mb-6">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
                      <MaterialIcons name={isDarkMode ? 'dark-mode' : 'light-mode'} size={24} color="#94a3b8" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Dark Mode</Text>
                      <Text className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{isDarkMode ? 'Active' : 'Off'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={toggleMode} className={`w-14 h-8 rounded-full p-1 ${isDarkMode ? 'bg-primary' : 'bg-slate-200'}`}>
                    <View className={`w-6 h-6 rounded-full bg-white shadow-md ${isDarkMode ? 'ml-6' : ''}`} />
                  </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-4">
                  {themes.map((theme) => (
                    <TouchableOpacity key={theme.id} onPress={() => setActiveThemeId && setActiveThemeId(theme.id)} className={`w-[47%] items-center p-6 rounded-3xl border-2 ${activeThemeId === theme.id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-surface-dark'}`}>
                      <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: theme.primary }}>
                        {activeThemeId === theme.id && <MaterialIcons name="verified" size={32} color="white" />}
                      </View>
                      <Text className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white mb-1">{theme.name}</Text>
                      <Text className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${activeThemeId === theme.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {activeThemeId === theme.id ? 'Active' : 'Use'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Menu Modal */}
      <Modal visible={isCreateMenuOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/70" onPress={() => setIsCreateMenuOpen(false)} />
          <View className="bg-white dark:bg-background-dark rounded-t-[3rem] p-6 pb-16">
            <TouchableOpacity onPress={() => setIsCreateMenuOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center z-10">
              <MaterialIcons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <View className="mt-4 gap-6">
              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center uppercase tracking-widest">Neural Input</Text>

              <View className="flex-row gap-4 h-52">
                <TouchableOpacity onPress={() => { setIsCreateMenuOpen(false); onNavigate(ScreenName.CAPTURE_CHOICE); }} className="flex-1 rounded-3xl overflow-hidden">
                  <LinearGradient colors={['#34d399', '#0d9488']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                      <MaterialIcons name="sensors" size={32} color="white" />
                    </View>
                    <Text className="text-lg font-bold text-white uppercase tracking-widest mb-1">Visual Lab</Text>
                    <Text className="text-[10px] text-white/70 uppercase font-semibold tracking-widest">Environmental Input</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setIsCreateMenuOpen(false); onNavigate(ScreenName.LINGUASENSE); }} className="flex-1 rounded-3xl overflow-hidden">
                  <LinearGradient colors={['#f43f5e', '#ea580c']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                      <MaterialIcons name="psychology" size={32} color="white" />
                    </View>
                    <Text className="text-lg font-bold text-white uppercase tracking-widest mb-1">Lingua Hub</Text>
                    <Text className="text-[10px] text-white/70 uppercase font-semibold tracking-widest">Semantic Grounding</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export const Header: React.FC<{ title: string; onBack?: () => void; rightAction?: React.ReactNode; }> = ({ title, onBack, rightAction }) => {
  return (
    <View className="w-full flex-row items-center bg-white/95 dark:bg-background-dark/95 px-4 py-4 pt-14 justify-between border-b border-slate-200 dark:border-slate-800">
      <View className="w-12 items-start">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="w-10 h-10 rounded-full items-center justify-center">
            <MaterialIcons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-slate-900 dark:text-white text-lg font-bold tracking-tighter flex-1 text-center uppercase" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-12 items-end">
        {rightAction || <View className="w-10 h-10" />}
      </View>
    </View>
  );
};
