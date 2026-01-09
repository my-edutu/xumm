import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { ScreenName, Task, LinguasenseTask } from '../types';
import { Header } from '../components/Shared';
import { supabase } from '../supabaseClient';

interface ScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onCompleteTask?: (reward: number, xp: number) => void;
}

// Enhanced Service with Supabase Integration
const TaskService = {
  fetchActivePool: async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      if (data && data.length > 0) return data as any;
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to mock data", e);
    }

    // Fallback Mock Data
    await new Promise(r => setTimeout(r, 800));
    return [
      { id: '1', title: 'Street Sign Labeling', description: 'Identify signs in urban images.', reward: 0.50, xp: 25, timeEstimate: '2m', difficulty: 'Easy', type: 'image', priority: true },
      { id: '2', title: 'Local Dialect Recording', description: 'Read sentences in native accent.', reward: 1.25, xp: 50, timeEstimate: '5m', difficulty: 'Medium', type: 'audio' },
      { id: '3', title: 'Sentiment Analysis', description: 'Analyze social media tones.', reward: 0.15, xp: 10, timeEstimate: '1m', difficulty: 'Easy', type: 'text' },
      { id: '4', title: 'Object Detection', description: 'Draw boxes around vehicles.', reward: 0.75, xp: 30, timeEstimate: '3m', difficulty: 'Medium', type: 'image' },
    ];
  },
  submitPayload: async (taskId: string, payload: any, reward: number, xp: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          submission_data: payload,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const { error: rpcError } = await supabase.rpc('process_task_reward', {
        p_user_id: user.id,
        p_submission_id: data.id,
        p_reward: reward,
        p_xp: xp
      });

      if (rpcError) console.error("Reward logic failed:", rpcError);

      return { status: 'success', accreditation: 'instant' };
    } catch (e) {
      console.warn("Supabase submission failed", e);
      return { status: 'error', message: 'Handshake failed' };
    }
  }
};

export const TaskMarketplaceScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'All' | 'Audio' | 'Text' | 'Image'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const featuredTasksList = [
    { id: 'f1', title: 'AI Perception Lab', description: 'Validate object depth in 3D lidar scans.', reward: 2.50, xp: 50, time: '3m', colors: ['#2563eb', '#4338ca'] as [string, string] },
    { id: 'f2', title: 'Neural Audit v2', description: 'Review high-sensitivity dialogue safety.', reward: 1.80, xp: 35, time: '2m', colors: ['#7c3aed', '#db2777'] as [string, string] },
    { id: 'f3', title: 'Visual Grounding', description: 'Identify spatial relationships in scenes.', reward: 3.10, xp: 60, time: '5m', colors: ['#059669', '#0d9488'] as [string, string] }
  ];

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await TaskService.fetchActivePool();
      setTasks(data);
    } catch (e) {
      console.error("Connection error during handshake");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t =>
    (filter === 'All' || t.type.toLowerCase() === filter.toLowerCase()) &&
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header
        title="Task"
        onBack={() => onNavigate(ScreenName.HOME)}
        rightAction={
          <TouchableOpacity onPress={handleRefresh} className="p-2">
            <MaterialIcons name="refresh" size={24} color={isLoading ? '#1349ec' : '#94a3b8'} />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Search */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl h-14 px-4">
            <MaterialIcons name="search" size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search active protocols..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-slate-900 dark:text-white"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-4">
          <View className="flex-row gap-2">
            {['All', 'Audio', 'Text', 'Image'].map((f) => (
              <TouchableOpacity key={f} onPress={() => setFilter(f as any)} className={`px-5 py-2.5 rounded-full ${filter === f ? 'bg-primary' : 'bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800'}`}>
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${filter === f ? 'text-white' : 'text-slate-500'}`}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <View className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mb-4" />
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing with Central Ledger...</Text>
          </View>
        ) : (
          <View className="px-4 gap-6">
            {/* Train Your AI Card */}
            {!searchQuery && (
              <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-white/5">
                <View className="absolute top-0 right-0 opacity-20">
                  <MaterialIcons name="psychology" size={100} color="#1349ec" />
                </View>
                <View className="relative z-10">
                  <View className="bg-primary/20 px-2 py-0.5 rounded self-start mb-3 border border-primary/30">
                    <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">Laboratory</Text>
                  </View>
                  <Text className="text-2xl font-bold text-white uppercase tracking-tighter mb-2">Train your{'\n'}own AI</Text>
                  <Text className="text-slate-400 text-sm mb-4">Personalize models with your data and preferences.</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">Open Neural Lab</Text>
                    <MaterialIcons name="arrow-forward" size={14} color="#1349ec" />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Featured Tasks */}
            {!searchQuery && (
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Featured Tasks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-4">
                    {featuredTasksList.map((fTask) => (
                      <TouchableOpacity key={fTask.id} onPress={() => onNavigate(ScreenName.TASK_DETAILS)} className="w-72 rounded-3xl overflow-hidden">
                        <LinearGradient colors={fTask.colors} style={{ padding: 24 }}>
                          <View className="absolute top-0 right-0 opacity-10">
                            <MaterialIcons name="auto-awesome" size={100} color="white" />
                          </View>
                          <View className="relative z-10">
                            <View className="bg-white/20 px-2 py-1 rounded self-start mb-3">
                              <Text className="text-[10px] font-semibold text-white uppercase tracking-widest">Priority Contract</Text>
                            </View>
                            <Text className="text-xl font-bold text-white uppercase tracking-tight mb-1">{fTask.title}</Text>
                            <Text className="text-white/70 text-sm mb-4 h-10">{fTask.description}</Text>
                            <View className="flex-row justify-between items-end">
                              <View className="flex-row gap-3">
                                <View className="flex-row items-center gap-1">
                                  <MaterialIcons name="bolt" size={14} color="white" />
                                  <Text className="text-[10px] font-semibold text-white">{fTask.xp} XP</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                  <MaterialIcons name="schedule" size={14} color="white" />
                                  <Text className="text-[10px] font-semibold text-white">{fTask.time}</Text>
                                </View>
                              </View>
                              <Text className="text-2xl font-bold text-white">${fTask.reward.toFixed(2)}</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Available Missions */}
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Available Missions</Text>
              <View className="gap-3">
                {filteredTasks.map((task) => (
                  <TouchableOpacity key={task.id} onPress={() => onNavigate(ScreenName.TASK_DETAILS)} className="flex-row items-center p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
                    <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3">
                      <MaterialIcons name={task.type === 'audio' ? 'mic' : task.type === 'text' ? 'description' : 'image'} size={20} color="#1349ec" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900 dark:text-white text-sm uppercase">{task.title}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="schedule" size={12} color="#94a3b8" />
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.timeEstimate}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="bolt" size={12} color="#10b981" />
                          <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{task.xp} XP</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-base font-bold text-primary">${task.reward.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Enhanced Service with Supabase/S3 Integration
export const StorageService = {
  getUploadUrl: async (fileName: string, contentType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('storage-manager', {
        body: {
          action: 'GET-UPLOAD-URL',
          bucket: 'xum-raw-submissions',
          fileName: `raw/${Date.now()}_${fileName}`,
          contentType
        }
      });
      if (error) throw error;
      return data.url;
    } catch (e) {
      console.error("S3 Handshake failed", e);
      return null;
    }
  },
  uploadToS3: async (url: string, blob: Blob) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': blob.type
        }
      });
      return response.ok;
    } catch (e) {
      console.error("Direct S3 transmission failed", e);
      return false;
    }
  }
};

export const TaskDetailsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Mission Brief" onBack={() => onNavigate(ScreenName.TASK_MARKETPLACE)} />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row items-center gap-3 mb-4 mt-6">
          <View className="px-3 py-1 bg-primary/10 rounded-full">
            <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">Image Labelling</Text>
          </View>
          <View className="px-3 py-1 bg-emerald-500/10 rounded-full">
            <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">High Accuracy</Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Street Sign Labelling</Text>
        <View className="flex-row gap-4 mb-8">
          <Text className="font-bold text-primary">$0.50 Reward</Text>
          <Text className="font-bold text-slate-500">2m Est.</Text>
        </View>

        <View className="gap-6">
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Objective</Text>
            <Text className="text-slate-600 dark:text-slate-300 text-base">Ground AI navigation protocols by identifying and categorizing urban signage in complex street view captures.</Text>
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1 p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">XP Bonus</Text>
              <Text className="text-xl font-bold text-primary">+25 XP</Text>
            </View>
            <View className="flex-1 p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Difficulty</Text>
              <Text className="text-xl font-bold text-slate-900 dark:text-white uppercase">Easy</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-background-dark/95 border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => onNavigate(ScreenName.TEXT_INPUT_TASK)} className="w-full h-14 bg-primary rounded-2xl items-center justify-center">
          <Text className="text-white font-bold uppercase tracking-widest text-sm">Accept Protocol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CaptureChoiceScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const choices = [
    { id: 'aud', title: 'Record Voice', desc: 'Audio linguistic grounding.', icon: 'mic', color: '#2563eb', screen: ScreenName.CAPTURE_AUDIO },
    { id: 'img', title: 'Capture Image', desc: 'Visual environment mapping.', icon: 'photo-camera', color: '#10b981', screen: ScreenName.MEDIA_CAPTURE },
    { id: 'vid', title: 'Record Video', desc: 'Temporal scene analysis.', icon: 'videocam', color: '#f43f5e', screen: ScreenName.CAPTURE_VIDEO },
    { id: 'txt', title: 'Write/Type Text', desc: 'Semantic text datasets.', icon: 'description', color: '#f97316', screen: ScreenName.TEXT_INPUT_TASK }
  ];

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Capture Data" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingVertical: 24 }}>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Environmental{'\n'}Sensing</Text>
        <View className="gap-4">
          {choices.map((choice) => (
            <TouchableOpacity key={choice.id} onPress={() => onNavigate(choice.screen)} className="flex-row items-center p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800">
              <View className="w-16 h-16 rounded-2xl items-center justify-center mr-5" style={{ backgroundColor: choice.color }}>
                <MaterialIcons name={choice.icon as any} size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 dark:text-white text-lg uppercase tracking-tight">{choice.title}</Text>
                <Text className="text-sm text-slate-500 mt-1">{choice.desc}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const CaptureVideoScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<any>(null);

  const handleRecord = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      setIsRecording(false);
      cameraRef.current.stopRecording();
    } else {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,
          quality: '720p',
        });
        setStatus('uploading');

        // Submit to backend
        await TaskService.submitPayload('video-capture', {
          type: 'video',
          uri: video.uri,
          s3_path: 'raw/video'
        }, 1.50, 40);

        setStatus('success');
        onCompleteTask?.(1.50, 40);
        setTimeout(() => onNavigate(ScreenName.TASK_SUCCESS), 1500);
      } catch (e) {
        console.error('Recording failed:', e);
        setIsRecording(false);
        Alert.alert('Error', 'Failed to record video. Please try again.');
      }
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-8">
        <MaterialIcons name="videocam-off" size={64} color="#94a3b8" />
        <Text className="text-white text-xl font-bold uppercase tracking-tight mt-6 mb-2 text-center">Camera Access Required</Text>
        <Text className="text-slate-500 text-center mb-8">XUM AI needs camera access to record video for AI training.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold uppercase tracking-widest">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="mt-4 p-4">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'uploading') {
    return (
      <View className="flex-1 bg-black items-center justify-center p-8">
        <View className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary mb-6" />
        <Text className="text-2xl font-bold text-white uppercase tracking-tight">Syncing Visuals</Text>
        <Text className="text-slate-500 text-sm mt-2">Transmitting to H-S3 Cluster...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="p-6 flex-row justify-between items-center absolute top-0 left-0 right-0 z-10">
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Video Lab</Text>
        <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
          <MaterialIcons name="flip-camera-ios" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        mode="video"
      >
        {isRecording && (
          <View className="absolute top-20 left-0 right-0 items-center">
            <View className="flex-row items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
              <View className="w-3 h-3 bg-red-500 rounded-full" />
              <Text className="text-white font-bold text-xs uppercase tracking-widest">Recording...</Text>
            </View>
          </View>
        )}
      </CameraView>

      <View className="p-12 items-center absolute bottom-0 left-0 right-0">
        <TouchableOpacity onPress={handleRecord} className={`w-24 h-24 rounded-full border-4 p-1.5 ${isRecording ? 'border-red-500' : 'border-white'}`}>
          <View className={`flex-1 rounded-full ${isRecording ? 'bg-red-500 rounded-lg' : 'bg-white'}`} style={isRecording ? { transform: [{ scale: 0.6 }] } : undefined} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MediaCaptureScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [label, setLabel] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setCapturedImage(photo.uri);
    } catch (e) {
      console.error('Capture failed:', e);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage || !label) return;

    setIsCapturing(true);
    try {
      await TaskService.submitPayload('image-capture', {
        type: 'image',
        label,
        uri: capturedImage,
        s3_path: 'raw/images'
      }, 0.50, 20);

      onCompleteTask?.(0.50, 20);
      onNavigate(ScreenName.TASK_SUCCESS);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit image. Please try again.');
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-8">
        <MaterialIcons name="photo-camera" size={64} color="#94a3b8" />
        <Text className="text-white text-xl font-bold uppercase tracking-tight mt-6 mb-2 text-center">Camera Access Required</Text>
        <Text className="text-slate-500 text-center mb-8">XUM AI needs camera access to capture images for AI training.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold uppercase tracking-widest">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="mt-4 p-4">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Preview captured image
  if (capturedImage) {
    return (
      <View className="flex-1 bg-black">
        <View className="p-6 flex-row justify-between items-center absolute top-0 left-0 right-0 z-10">
          <TouchableOpacity onPress={handleRetake} className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Preview</Text>
          <View className="w-12" />
        </View>

        <Image source={{ uri: capturedImage }} style={{ flex: 1 }} resizeMode="contain" />

        <View className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-black/80">
          <View className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-4">
            <Text className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Capture Label</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="What did you capture?"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="w-full h-12 text-white font-bold text-lg"
            />
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!label || isCapturing}
            className={`w-full h-14 bg-primary rounded-2xl items-center justify-center ${!label || isCapturing ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-bold uppercase tracking-widest">
              {isCapturing ? 'Submitting...' : 'Submit Capture'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="p-6 flex-row justify-between items-center absolute top-0 left-0 right-0 z-10">
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Image Lab</Text>
        <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
          <MaterialIcons name="flip-camera-ios" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      >
        {isCapturing && (
          <View className="absolute inset-0 bg-white/20 items-center justify-center">
            <View className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white" />
          </View>
        )}
      </CameraView>

      <View className="p-8 pb-12 items-center absolute bottom-0 left-0 right-0">
        <TouchableOpacity onPress={handleCapture} disabled={isCapturing} className={`w-24 h-24 rounded-full border-4 border-white p-1.5 ${isCapturing ? 'opacity-20' : ''}`}>
          <View className="flex-1 rounded-full bg-white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CaptureAudioScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'transmitting'>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioBars, setAudioBars] = useState<number[]>(new Array(12).fill(10));

  // Audio visualization effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
      }, 100);
    } else {
      setAudioBars(new Array(12).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleSubmit = async () => {
    if (!recordingUri || !description) return;

    setStatus('transmitting');
    try {
      await TaskService.submitPayload('audio-capture', {
        type: 'audio',
        description,
        uri: recordingUri,
        s3_path: 'raw/audio'
      }, 1.00, 35);

      onCompleteTask?.(1.00, 35);
      onNavigate(ScreenName.TASK_SUCCESS);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit audio. Please try again.');
      setStatus('idle');
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  if (!permissionResponse) {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <Text className="text-slate-500">Loading...</Text>
      </View>
    );
  }

  if (!permissionResponse.granted && !permissionResponse.canAskAgain) {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center p-8">
        <MaterialIcons name="mic-off" size={64} color="#94a3b8" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mt-6 mb-2 text-center">Microphone Access Required</Text>
        <Text className="text-slate-500 text-center mb-8">XUM AI needs microphone access to record audio for linguistic grounding.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold uppercase tracking-widest">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="mt-4 p-4">
          <Text className="text-slate-500 font-bold uppercase tracking-widest text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'transmitting') {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center p-8">
        <View className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary mb-6" />
        <Text className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Transmitting Frequencies</Text>
        <Text className="text-slate-500 text-sm mt-2">Syncing with H-S3 Archive...</Text>
      </View>
    );
  }

  // Show submit UI if we have a recording
  if (recordingUri && !isRecording) {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark">
        <Header title="Audio Captured" onBack={() => { setRecordingUri(null); }} />
        <View className="flex-1 p-6 items-center justify-center gap-8">
          <View className="w-32 h-32 rounded-full bg-emerald-500 items-center justify-center">
            <MaterialIcons name="check" size={60} color="white" />
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight text-center">Recording Complete</Text>

          <View className="w-full gap-4 mt-4">
            <View className="bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
              <Text className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Linguistic Context</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what you recorded..."
                placeholderTextColor="#94a3b8"
                multiline
                className="w-full h-24 text-slate-900 dark:text-white"
              />
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!description}
              className={`w-full h-16 rounded-3xl items-center justify-center bg-primary ${!description ? 'opacity-20' : ''}`}
            >
              <Text className="text-white font-bold uppercase tracking-widest text-sm">Submit Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRecordingUri(null)}
              className="w-full h-12 items-center justify-center"
            >
              <Text className="text-slate-500 font-bold uppercase tracking-widest text-sm">Record Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Audio Capture" onBack={() => onNavigate(ScreenName.CAPTURE_CHOICE)} />
      <View className="flex-1 p-6 items-center justify-center gap-12">
        <TouchableOpacity onPress={handleRecord} className="relative w-48 h-48 items-center justify-center">
          <View className={`absolute inset-0 rounded-full bg-primary/20 ${isRecording ? 'scale-150 opacity-0' : 'scale-100'}`} />
          <View className={`w-32 h-32 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-primary'}`}>
            <MaterialIcons name={isRecording ? 'stop' : 'mic'} size={60} color="white" />
          </View>
        </TouchableOpacity>

        {/* Audio Visualizer */}
        <View className="flex-row items-end justify-center gap-1 h-12">
          {audioBars.map((h, i) => (
            <View
              key={i}
              className={`w-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </View>

        <View className="w-full">
          <Text className="text-center text-slate-500 font-bold uppercase tracking-widest text-sm">
            {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const HybridCaptureScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [step, setStep] = useState<'video' | 'labeling'>('video');
  const [tags, setTags] = useState<string[]>([]);

  const handleNext = async () => {
    if (step === 'video') setStep('labeling');
    else {
      await TaskService.submitPayload('hybrid-task-id', { tags, description: 'Hybrid data' }, 2.50, 60);
      onCompleteTask?.(2.50, 60);
      onNavigate(ScreenName.TASK_SUCCESS);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-6 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => onNavigate(ScreenName.CAPTURE_CHOICE)} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
          <MaterialIcons name="close" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Hybrid Protocol</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === 'video' ? (
          <View className="p-6 items-center gap-8">
            <View className="w-full aspect-square rounded-3xl bg-white/5 border border-white/10 items-center justify-center overflow-hidden">
              <MaterialIcons name="videocam" size={80} color="rgba(255,255,255,0.1)" />
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white uppercase tracking-tighter mb-2">Capture Visuals</Text>
              <Text className="text-white/40 text-sm">Record a 10s clip of your current environment.</Text>
            </View>
          </View>
        ) : (
          <View className="p-6 gap-6">
            <View className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <Text className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Select Semantic Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {['Urban', 'Indoor', 'Speech', 'Crowded', 'Noisy', 'Nature', 'Traffic'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-4 py-2 rounded-full ${tags.includes(t) ? 'bg-emerald-500' : 'bg-white/5 border border-white/10'}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${tags.includes(t) ? 'text-white' : 'text-white/40'}`}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <Text className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Scene Description</Text>
              <TextInput placeholder="Describe the sequence..." placeholderTextColor="rgba(255,255,255,0.3)" multiline className="w-full h-24 text-white text-sm" />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-6 pb-12 bg-slate-950/80 border-t border-white/5">
        <TouchableOpacity onPress={handleNext} className="w-full h-16 bg-white rounded-3xl items-center justify-center">
          <Text className="text-slate-950 font-bold uppercase tracking-widest text-sm">{step === 'video' ? 'Next: Labelling' : 'Seal Submission'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const TextInputTaskScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      await TaskService.submitPayload('mock-id-1', { response: value }, 0.50, 25);
      setStatus('success');
      onCompleteTask?.(0.50, 25);
      setTimeout(() => onNavigate(ScreenName.TASK_SUCCESS), 1500);
    } catch (e) {
      setStatus('idle');
      Alert.alert("Error", "Submission failed. Handshake interrupted.");
    }
  };

  if (status === 'submitting') {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center p-8">
        <View className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary mb-6" />
        <Text className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Syncing Data</Text>
        <Text className="text-slate-500 text-sm">Uploading contribution to decentralized node...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-background-dark">
      <Header title="Mission Execution" onBack={() => onNavigate(ScreenName.TASK_DETAILS)} />
      <View className="flex-1 p-6">
        <View className="bg-primary/10 rounded-3xl p-6 border border-primary/20 mb-8">
          <Text className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Prompt Protocol</Text>
          <Text className="text-slate-900 dark:text-white text-lg">"Identify and transcribe the text visible on the main billboard in this scene."</Text>
        </View>

        <View className="flex-1 gap-4">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contributor Input</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter transcription here..."
            placeholderTextColor="#94a3b8"
            multiline
            className="flex-1 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-6 text-lg text-slate-900 dark:text-white"
          />
        </View>

        <View className="pt-8">
          <TouchableOpacity
            disabled={!value}
            onPress={handleSubmit}
            className={`w-full h-16 bg-primary rounded-3xl items-center justify-center ${!value ? 'opacity-20' : ''}`}
          >
            <Text className="text-white font-bold uppercase tracking-widest">Submit Contribution</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const TaskSuccessScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center p-8">
      <View className="w-40 h-40 rounded-full bg-emerald-500 items-center justify-center mb-8 shadow-lg">
        <MaterialIcons name="verified" size={80} color="white" />
      </View>
      <Text className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter text-center mb-2">Contribution{'\n'}Validated</Text>
      <Text className="text-slate-500 text-sm mb-12 text-center max-w-xs">Handshake successful. Your accreditation is being processed by the network.</Text>

      <View className="flex-row gap-4 w-full max-w-sm mb-12">
        <View className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800 items-center">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accredited</Text>
          <Text className="text-2xl font-bold text-primary">+$0.50</Text>
        </View>
        <View className="flex-1 p-6 rounded-3xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-slate-800 items-center">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Node Exp</Text>
          <Text className="text-2xl font-bold text-emerald-500">+25 XP</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => onNavigate(ScreenName.HOME)} className="w-full max-w-xs h-16 bg-primary rounded-3xl items-center justify-center">
        <Text className="text-white font-bold uppercase tracking-widest">Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export const LinguasenseScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const engineStats = [
    { label: 'Global Reaching', value: '114 Nodes' },
    { label: 'Dataset Purity', value: '99.8%' },
    { label: 'Human Network', value: '2.4M' }
  ];

  const categories = [
    { id: 'l1', title: 'Grounding (H2D)', desc: 'Convert human dialects into machine intelligence.', icon: 'psychology', colors: ['#2563eb', '#4338ca'] as [string, string], count: 42 },
    { id: 'l2', title: 'Synthesis (D2H)', desc: 'Test AI comprehension of complex cultural cues.', icon: 'auto-awesome', colors: ['#7c3aed', '#db2777'] as [string, string], count: 18 },
    { id: 'l3', title: 'Audit Layer', desc: 'Identify and correct hallucinations in LLM outputs.', icon: 'security', colors: ['#059669', '#0d9488'] as [string, string], count: 31 }
  ];

  return (
    <View className="flex-1 bg-slate-950">
      <Header title="Linguasense Engine" onBack={() => onNavigate(ScreenName.HOME)} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View className="px-6 pt-4 pb-8">
          <LinearGradient colors={['#0f172a', '#1e293b', 'rgba(19,73,236,0.2)']} style={{ borderRadius: 24, padding: 32, overflow: 'hidden', position: 'relative' }}>
            <View className="absolute top-0 right-0 opacity-20">
              <MaterialIcons name="hub" size={140} color="#1349ec" />
            </View>
            <View className="relative z-10">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-2 h-2 bg-primary rounded-full" />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">Core Systems Active</Text>
              </View>
              <Text className="text-4xl font-bold text-white uppercase tracking-tighter mb-4">Deep{'\n'}Language Lab</Text>
              <Text className="text-slate-400 text-sm mb-8 max-w-[200px]">Bridges the gap between human culture and artificial reasoning.</Text>

              <View className="flex-row gap-4 border-t border-white/5 pt-6">
                {engineStats.map((stat, i) => (
                  <View key={i} className="flex-1">
                    <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</Text>
                    <Text className="text-xs font-bold text-white uppercase">{stat.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View className="px-6 pb-6">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-4">Neural Infrastructure</Text>
          <View className="gap-4">
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} onPress={() => onNavigate(ScreenName.LANGUAGE_RUNNER)} className="p-6 rounded-3xl bg-slate-900/50 border border-white/5">
                <View className="flex-row items-center gap-6">
                  <View className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center">
                    <MaterialIcons name={cat.icon as any} size={24} color="#1349ec" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="font-bold text-white text-lg uppercase tracking-tight">{cat.title}</Text>
                      <Text className="text-[10px] font-bold text-primary uppercase">{cat.count} Tasks</Text>
                    </View>
                    <Text className="text-xs text-slate-400">{cat.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="px-10 mt-4">
          <View className="py-4 border-t border-white/5 flex-row justify-between">
            <Text className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Encryption: AES-256</Text>
            <Text className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Status: 200 OK</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const LanguageTaskRunnerScreen: React.FC<ScreenProps> = ({ onNavigate, onCompleteTask }) => {
  const [textValue, setTextValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async () => {
    await TaskService.submitPayload('ls_1', { text: textValue }, 0.75, 30);
    onCompleteTask?.(0.75, 30);
    onNavigate(ScreenName.TASK_SUCCESS);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Grounding Engine" onBack={() => onNavigate(ScreenName.LINGUASENSE)} />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingVertical: 24 }}>
        {/* Progress */}
        <View className="flex-row gap-1.5 mb-8">
          <View className="h-1 flex-1 bg-primary rounded-full" />
          <View className="h-1 flex-1 bg-slate-200 dark:bg-slate-900 rounded-full" />
          <View className="h-1 flex-1 bg-slate-200 dark:bg-slate-900 rounded-full" />
        </View>

        {/* Prompt */}
        <View className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-white/5 mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="bg-primary px-2 py-0.5 rounded">
              <Text className="text-[9px] font-bold text-white uppercase tracking-widest">Yoruba-Pidgin</Text>
            </View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Street commerce and fashion.</Text>
          </View>
          <Text className="text-slate-900 dark:text-white font-bold text-2xl">What is the local slang for "Fake/Imitation" in Lagos?</Text>
        </View>

        {/* Text Input */}
        <View className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-white/5 mb-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ground Truth Input</Text>
          <TextInput
            value={textValue}
            onChangeText={setTextValue}
            placeholder="Expose the cultural nuance here..."
            placeholderTextColor="#94a3b8"
            multiline
            className="w-full min-h-[100px] text-slate-900 dark:text-white font-bold text-xl"
          />
        </View>

        {/* Audio Recording */}
        <View className={`p-6 rounded-3xl border-2 flex-row items-center justify-between ${isRecording ? 'bg-red-500/5 border-red-500' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5'}`}>
          <View className="flex-1">
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isRecording ? 'text-red-500' : 'text-primary'}`}>
              {isRecording ? 'Capturing Frequency...' : 'Audio Synthesis'}
            </Text>
            <View className="flex-row items-end gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                <View key={i} className={`w-1 rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: `${isRecording ? Math.random() * 40 + 10 : 10}%` }} />
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={() => setIsRecording(!isRecording)} className={`w-20 h-20 rounded-2xl items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-slate-900 dark:bg-primary'}`}>
            <MaterialIcons name={isRecording ? 'stop-circle' : 'mic'} size={32} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="p-6 pb-12">
        <TouchableOpacity disabled={!textValue} onPress={handleSubmit} className={`w-full h-16 bg-primary rounded-3xl items-center justify-center flex-row gap-3 ${!textValue ? 'opacity-30' : ''}`}>
          <Text className="text-white font-bold uppercase tracking-widest">Finalize Synthesis</Text>
          <MaterialIcons name="psychology" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Placeholder screens
export const CreateTaskScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Create" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center">
      <MaterialIcons name="add-circle" size={64} color="#94a3b8" />
      <Text className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);

export const ValidationTaskScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Validation" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center">
      <MaterialIcons name="fact-check" size={64} color="#94a3b8" />
      <Text className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);

export const TaskSubmissionScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Review" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center">
      <MaterialIcons name="rate-review" size={64} color="#94a3b8" />
      <Text className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);

export const XUMJudgeTaskScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Judge" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center">
      <MaterialIcons name="gavel" size={64} color="#94a3b8" />
      <Text className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);

export const RLHFCorrectionTaskScreen: React.FC<ScreenProps> = ({ onNavigate }) => (
  <View className="flex-1 bg-white dark:bg-background-dark">
    <Header title="Correction" onBack={() => onNavigate(ScreenName.HOME)} />
    <View className="flex-1 items-center justify-center">
      <MaterialIcons name="edit" size={64} color="#94a3b8" />
      <Text className="text-slate-500 mt-4 font-bold uppercase tracking-widest">Coming Soon</Text>
    </View>
  </View>
);
