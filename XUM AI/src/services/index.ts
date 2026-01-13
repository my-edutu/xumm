/**
 * XUM AI - Services Index
 * 
 * Central export point for all service modules.
 */

// Task submission and prompts
export {
    TaskService,
    uploadFile,
    getRandomPrompts,
    getPromptById,
    submitTask,
    getUserSubmissions,
    getUserTaskStats,
    generateSessionId,
    checkJudgeUnlock,
} from './taskService';

export type {
    TaskType,
    TaskPrompt,
    TaskSubmission,
    SubmissionStatus,
    UploadResult,
    SubmissionResult,
} from './taskService';

// Media capture
export {
    MediaCapture,
    requestAudioPermission,
    startAudioRecording,
    stopAudioRecording,
    cancelAudioRecording,
    requestCameraPermission,
    captureImage,
    pickImage,
    captureVideo,
    pickVideo,
    getFileExtension,
    formatDuration,
    formatFileSize,
} from './mediaCapture';

export type {
    CaptureResult,
    PermissionResult,
} from './mediaCapture';
