/**
 * XUM AI - Media Capture Service
 * 
 * Handles audio recording, image capture, and video recording using Expo APIs.
 * Provides a unified interface for all media capture operations.
 */

import { useAudioRecorder, AudioModule } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import ReactNative from 'react-native';
const { Platform } = ReactNative;

// ============================================================================
// TYPES
// ============================================================================

export interface CaptureResult {
    success: boolean;
    uri?: string;
    duration?: number;
    size?: number;
    error?: string;
}

export interface PermissionResult {
    granted: boolean;
    canAskAgain: boolean;
}

// ============================================================================
// AUDIO RECORDING (using expo-audio)
// ============================================================================

let audioRecordingStartTime: number | null = null;

/**
 * Request microphone permission
 */
export async function requestAudioPermission(): Promise<PermissionResult> {
    try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        return { granted: status.granted, canAskAgain: status.canAskAgain };
    } catch (err) {
        console.error('[Audio] Permission error:', err);
        return { granted: false, canAskAgain: true };
    }
}

// Create a module-level recorder reference placeholder
let activeRecorderRef: any = null;

/**
 * Start audio recording (returns a function to stop)
 */
export async function startAudioRecording(recorderRef?: any): Promise<boolean> {
    try {
        // Request permission first
        const permission = await requestAudioPermission();
        if (!permission.granted) {
            console.warn('[Audio] Permission not granted');
            return false;
        }

        if (recorderRef) {
            activeRecorderRef = recorderRef;
            recorderRef.record();
            audioRecordingStartTime = Date.now();
            console.log('[Audio] Recording started');
            return true;
        }

        console.warn('[Audio] No recorder reference provided');
        return false;
    } catch (err) {
        console.error('[Audio] Start recording error:', err);
        return false;
    }
}

/**
 * Stop audio recording and return the file URI
 */
export async function stopAudioRecording(recorderRef?: any): Promise<CaptureResult> {
    try {
        const recorder = recorderRef || activeRecorderRef;
        if (!recorder) {
            return { success: false, error: 'No active recording' };
        }

        // Stop recording
        await recorder.stop();
        const uri = recorder.uri;
        const duration = audioRecordingStartTime ? Math.round((Date.now() - audioRecordingStartTime) / 1000) : 0;

        audioRecordingStartTime = null;
        activeRecorderRef = null;

        if (!uri) {
            return { success: false, error: 'No recording URI' };
        }

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const size = fileInfo.exists ? (fileInfo as any).size : 0;

        console.log('[Audio] Recording stopped:', uri);
        return {
            success: true,
            uri,
            duration,
            size,
        };
    } catch (err: any) {
        console.error('[Audio] Stop recording error:', err);
        return { success: false, error: err.message || 'Failed to stop recording' };
    }
}

/**
 * Cancel active recording
 */
export async function cancelAudioRecording(recorderRef?: any): Promise<void> {
    try {
        const recorder = recorderRef || activeRecorderRef;
        if (recorder) {
            await recorder.stop();
        }
        audioRecordingStartTime = null;
        activeRecorderRef = null;
    } catch (err) {
        console.error('[Audio] Cancel recording error:', err);
    }
}

// ============================================================================
// IMAGE CAPTURE
// ============================================================================

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
    try {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
        return { granted: status === 'granted', canAskAgain };
    } catch (err) {
        console.error('[Camera] Permission error:', err);
        return { granted: false, canAskAgain: true };
    }
}

/**
 * Capture image using camera
 */
export async function captureImage(): Promise<CaptureResult> {
    try {
        // Request permission
        const permission = await requestCameraPermission();
        if (!permission.granted) {
            return { success: false, error: 'Camera permission not granted' };
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: false,
            exif: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return { success: false, error: 'Capture cancelled' };
        }

        const asset = result.assets[0];

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        const size = fileInfo.exists ? (fileInfo as any).size : 0;

        return {
            success: true,
            uri: asset.uri,
            size,
        };
    } catch (err: any) {
        console.error('[Camera] Capture error:', err);
        return { success: false, error: err.message || 'Failed to capture image' };
    }
}

/**
 * Pick image from gallery
 */
export async function pickImage(): Promise<CaptureResult> {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return { success: false, error: 'Selection cancelled' };
        }

        const asset = result.assets[0];

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        const size = fileInfo.exists ? (fileInfo as any).size : 0;

        return {
            success: true,
            uri: asset.uri,
            size,
        };
    } catch (err: any) {
        console.error('[Gallery] Pick error:', err);
        return { success: false, error: err.message || 'Failed to pick image' };
    }
}

// ============================================================================
// VIDEO RECORDING
// ============================================================================

/**
 * Capture video using camera
 */
export async function captureVideo(maxDuration: number = 15): Promise<CaptureResult> {
    try {
        // Request camera and microphone permissions
        const cameraPermission = await requestCameraPermission();
        const audioPermission = await requestAudioPermission();

        if (!cameraPermission.granted || !audioPermission.granted) {
            return { success: false, error: 'Camera and microphone permissions required' };
        }

        // Launch video capture
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            videoMaxDuration: maxDuration,
            quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return { success: false, error: 'Recording cancelled' };
        }

        const asset = result.assets[0];

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        const size = fileInfo.exists ? (fileInfo as any).size : 0;

        return {
            success: true,
            uri: asset.uri,
            duration: asset.duration ? Math.round(asset.duration) : 0,
            size,
        };
    } catch (err: any) {
        console.error('[Video] Capture error:', err);
        return { success: false, error: err.message || 'Failed to capture video' };
    }
}

/**
 * Pick video from gallery
 */
export async function pickVideo(): Promise<CaptureResult> {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return { success: false, error: 'Selection cancelled' };
        }

        const asset = result.assets[0];

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        const size = fileInfo.exists ? (fileInfo as any).size : 0;

        return {
            success: true,
            uri: asset.uri,
            duration: asset.duration ? Math.round(asset.duration) : 0,
            size,
        };
    } catch (err: any) {
        console.error('[Video] Pick error:', err);
        return { success: false, error: err.message || 'Failed to pick video' };
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get file extension from URI
 */
export function getFileExtension(uri: string): string {
    const parts = uri.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Format duration to MM:SS
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const MediaCapture = {
    // Audio
    requestAudioPermission,
    startAudioRecording,
    stopAudioRecording,
    cancelAudioRecording,

    // Image
    requestCameraPermission,
    captureImage,
    pickImage,

    // Video
    captureVideo,
    pickVideo,

    // Utilities
    getFileExtension,
    formatDuration,
    formatFileSize,
};

export default MediaCapture;
