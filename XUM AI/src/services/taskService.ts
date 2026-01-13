/**
 * XUM AI - Task Submission Service
 * 
 * Handles media uploads to Supabase Storage and task submission to database.
 * Supports voice recordings, images, and videos.
 */

import { supabase } from '../supabaseClient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// ============================================================================
// TYPES
// ============================================================================

export type TaskType = 'voice' | 'image' | 'video';
export type SubmissionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface TaskPrompt {
    id: string;
    task_type: TaskType;
    prompt_text: string;
    category: string;
    hint_text?: string;
    base_reward: number;
    bonus_reward: number;
    language_code?: string;
    difficulty_level: number;
}

export interface TaskSubmission {
    id?: string;
    user_id: string;
    prompt_id: string;
    task_type: TaskType;
    file_url: string;
    file_size?: number;
    duration_seconds?: number;
    translation_text?: string;
    description?: string;
    status: SubmissionStatus;
    base_reward: number;
    bonus_reward: number;
    total_reward: number;
    session_id?: string;
    metadata?: Record<string, any>;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    filePath?: string;
}

export interface SubmissionResult {
    success: boolean;
    submission?: TaskSubmission;
    error?: string;
}

export interface FeaturedTask {
    id: string;
    title: string;
    subtitle?: string;
    badge_text: string;
    gradient_start: string;
    gradient_end: string;
    icon_name: string;
    target_screen: string;
    display_order: number;
}

export interface AdminTask {
    id: string;
    category: 'daily_mission' | 'xum_judge';
    title: string;
    subtitle?: string;
    description?: string;
    icon_name: string;
    icon_color: string;
    reward: number;
    estimated_time?: string;
    target_screen: string;
    is_locked_for_new_users?: boolean;
    unlock_after_tasks?: number;
    is_unlocked?: boolean; // Virtual field from function
}

export interface Transaction {
    id: string;
    user_id: string;
    type: 'earn' | 'bonus' | 'withdraw' | 'refund' | 'adjustment';
    amount: number;
    description: string;
    reference_type?: string;
    reference_id?: string;
    created_at: string;
}

export interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    total_earned: number;
    tasks_completed: number;
    rank: number;
}

// ============================================================================
// STORAGE BUCKETS
// ============================================================================

const STORAGE_BUCKETS = {
    voice: 'voice-recordings',
    image: 'image-captures',
    video: 'video-recordings',
};

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    localUri: string,
    taskType: TaskType,
    userId: string,
    fileExtension: string
): Promise<UploadResult> {
    try {
        console.log(`[Upload] Starting upload for ${taskType} task (${fileExtension})`);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${userId}/${timestamp}.${fileExtension}`;
        const bucket = STORAGE_BUCKETS[taskType];

        // Validate local URI
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists) {
            throw new Error(`File not found at path: ${localUri}`);
        }
        const fileSize = (fileInfo as any).size || 0;

        // Read file as base64
        // NOTE: For very large video files, this might cause OOM. 
        // Ideally we would use uploadAsync for large files, but that requires signed URLs or a different flow.
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: 'base64',
        });

        // Determine content type
        const contentType = getContentType(taskType, fileExtension);

        // Upload to Supabase Storage with timeout
        const uploadPromise = supabase.storage
            .from(bucket)
            .upload(filename, decode(base64), {
                contentType,
                upsert: false,
            });

        const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
            setTimeout(() => reject(new Error('Upload request timed out after 30s')), 30000)
        );

        const raceResult = await Promise.race([uploadPromise, timeoutPromise]) as { data: any; error: any };
        const { data, error } = raceResult;

        if (error) {
            console.error('[Upload] Storage error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        console.log('[Upload] Success:', urlData.publicUrl);

        return {
            success: true,
            url: urlData.publicUrl,
            filePath: data.path,
        };
    } catch (err: any) {
        console.error('[Upload] Exception:', err);
        return { success: false, error: err.message || 'Upload failed' };
    }
}

/**
 * Get MIME content type based on task type and file extension
 */
function getContentType(taskType: TaskType, extension: string): string {
    switch (taskType) {
        case 'voice':
            if (extension === 'webm') return 'audio/webm';
            if (extension === 'm4a') return 'audio/m4a';
            return 'audio/mpeg';
        case 'image':
            if (extension === 'png') return 'image/png';
            if (extension === 'webp') return 'image/webp';
            return 'image/jpeg';
        case 'video':
            if (extension === 'webm') return 'video/webm';
            return 'video/mp4';
        default:
            return 'application/octet-stream';
    }
}

// ============================================================================
// PROMPT FUNCTIONS
// ============================================================================

/**
 * Get random prompts for a task type
 */
export async function getRandomPrompts(
    taskType: TaskType,
    userId: string,
    count: number = 5
): Promise<TaskPrompt[]> {
    try {
        // Call the database function
        const { data, error } = await supabase.rpc('get_random_prompts', {
            p_task_type: taskType,
            p_user_id: userId,
            p_count: count,
        });

        if (error) {
            console.error('[Prompts] RPC error:', error);
            return getFallbackPrompts(taskType, count);
        }

        return data || getFallbackPrompts(taskType, count);
    } catch (err) {
        console.error('[Prompts] Exception:', err);
        return getFallbackPrompts(taskType, count);
    }
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(promptId: string): Promise<TaskPrompt | null> {
    try {
        const { data, error } = await supabase
            .from('capture_prompts')
            .select('*')
            .eq('id', promptId)
            .single();

        if (error) {
            console.error('[Prompts] Get by ID error:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('[Prompts] Exception:', err);
        return null;
    }
}

/**
 * Fallback prompts when database is unavailable
 */
function getFallbackPrompts(taskType: TaskType, count: number): TaskPrompt[] {
    const prompts: Record<TaskType, TaskPrompt[]> = {
        voice: [
            { id: 'v1', task_type: 'voice', prompt_text: 'Say: "The quick brown fox jumps over the lazy dog"', category: 'Pronunciation', base_reward: 0.15, bonus_reward: 0.10, difficulty_level: 1 },
            { id: 'v2', task_type: 'voice', prompt_text: 'Count from 1 to 20 in your native language', category: 'Numbers', base_reward: 0.15, bonus_reward: 0.10, difficulty_level: 1 },
            { id: 'v3', task_type: 'voice', prompt_text: 'Describe what you had for breakfast today', category: 'Conversation', base_reward: 0.20, bonus_reward: 0.15, difficulty_level: 2 },
            { id: 'v4', task_type: 'voice', prompt_text: 'Read: "Artificial intelligence is transforming how we work"', category: 'Technology', base_reward: 0.15, bonus_reward: 0.10, difficulty_level: 1 },
            { id: 'v5', task_type: 'voice', prompt_text: 'Greet someone and ask how their day is going', category: 'Greetings', base_reward: 0.15, bonus_reward: 0.10, difficulty_level: 1 },
        ],
        image: [
            { id: 'i1', task_type: 'image', prompt_text: 'Take a photo of a street sign', category: 'Signs', hint_text: 'Make sure the text is clearly readable', base_reward: 0.10, bonus_reward: 0.05, difficulty_level: 1 },
            { id: 'i2', task_type: 'image', prompt_text: 'Capture an image of food on a plate', category: 'Food', hint_text: 'Show the entire dish from above', base_reward: 0.10, bonus_reward: 0.05, difficulty_level: 1 },
            { id: 'i3', task_type: 'image', prompt_text: 'Photograph a vehicle (car, motorcycle, bus)', category: 'Vehicles', hint_text: 'Get the full vehicle in frame', base_reward: 0.10, bonus_reward: 0.05, difficulty_level: 1 },
            { id: 'i4', task_type: 'image', prompt_text: 'Take a picture of handwritten text', category: 'Handwriting', hint_text: 'Ensure good lighting and focus', base_reward: 0.15, bonus_reward: 0.10, difficulty_level: 2 },
            { id: 'i5', task_type: 'image', prompt_text: 'Capture a product with its label visible', category: 'Products', hint_text: 'Brand name should be readable', base_reward: 0.10, bonus_reward: 0.05, difficulty_level: 1 },
        ],
        video: [
            { id: 'd1', task_type: 'video', prompt_text: 'Record yourself waving hello', category: 'Gestures', hint_text: '5-10 seconds, face clearly visible', base_reward: 0.25, bonus_reward: 0.15, difficulty_level: 1 },
            { id: 'd2', task_type: 'video', prompt_text: 'Film a short walk through a room', category: 'Environment', hint_text: 'Keep the camera steady', base_reward: 0.30, bonus_reward: 0.15, difficulty_level: 2 },
            { id: 'd3', task_type: 'video', prompt_text: 'Record opening and closing a door', category: 'Actions', hint_text: 'Show the full door movement', base_reward: 0.25, bonus_reward: 0.15, difficulty_level: 1 },
            { id: 'd4', task_type: 'video', prompt_text: 'Film yourself making a thumbs up gesture', category: 'Gestures', hint_text: 'Hand clearly visible', base_reward: 0.25, bonus_reward: 0.15, difficulty_level: 1 },
            { id: 'd5', task_type: 'video', prompt_text: 'Record traffic at an intersection', category: 'Traffic', hint_text: '10-15 seconds of moving vehicles', base_reward: 0.35, bonus_reward: 0.20, difficulty_level: 2 },
        ],
    };

    return prompts[taskType].slice(0, count);
}

// ============================================================================
// SUBMISSION FUNCTIONS
// ============================================================================

/**
 * Submit a completed task
 */
export async function submitTask(
    userId: string,
    promptId: string,
    taskType: TaskType,
    fileUrl: string,
    options: {
        translationText?: string;
        description?: string;
        durationSeconds?: number;
        fileSize?: number;
        sessionId?: string;
        metadata?: Record<string, any>;
    } = {}
): Promise<SubmissionResult> {
    try {
        // Get prompt details for reward calculation
        const prompt = await getPromptById(promptId);
        const baseReward = prompt?.base_reward || 0.15;
        const bonusReward = options.translationText ? (prompt?.bonus_reward || 0.10) : 0;
        const totalReward = baseReward + bonusReward;

        const submission: Partial<TaskSubmission> = {
            user_id: userId,
            prompt_id: promptId,
            task_type: taskType,
            file_url: fileUrl,
            file_size: options.fileSize,
            duration_seconds: options.durationSeconds,
            translation_text: options.translationText,
            description: options.description,
            status: 'pending',
            base_reward: baseReward,
            bonus_reward: bonusReward,
            total_reward: totalReward,
            session_id: options.sessionId,
            metadata: options.metadata,
        };

        const { data, error } = await supabase
            .from('task_submissions')
            .insert(submission)
            .select()
            .single();

        if (error) {
            console.error('[Submit] Insert error:', error);
            return { success: false, error: error.message };
        }

        // Log activity
        await logTaskActivity(userId, taskType, totalReward, data.id);

        return { success: true, submission: data };
    } catch (err: any) {
        console.error('[Submit] Exception:', err);
        return { success: false, error: err.message || 'Submission failed' };
    }
}

/**
 * Log task activity to user_activities table
 */
async function logTaskActivity(
    userId: string,
    taskType: TaskType,
    reward: number,
    submissionId: string
): Promise<void> {
    try {
        const activityType = taskType === 'voice' ? 'voice_recording'
            : taskType === 'image' ? 'image_capture'
                : 'video_recording';

        await supabase.rpc('log_user_activity', {
            p_user_id: userId,
            p_activity_type: activityType,
            p_description: `Completed ${taskType} capture task`,
            p_reference_type: 'task_submission',
            p_reference_id: submissionId,
            p_reward: reward,
        });
    } catch (err) {
        console.warn('[Activity] Failed to log activity:', err);
    }
}

/**
 * Get user's submission history
 */
export async function getUserSubmissions(
    userId: string,
    options: {
        taskType?: TaskType;
        status?: SubmissionStatus;
        limit?: number;
        offset?: number;
    } = {}
): Promise<TaskSubmission[]> {
    try {
        let query = supabase
            .from('task_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (options.taskType) {
            query = query.eq('task_type', options.taskType);
        }
        if (options.status) {
            query = query.eq('status', options.status);
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[Submissions] Query error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[Submissions] Exception:', err);
        return [];
    }
}

/**
 * Get user's task statistics
 */
export async function getUserTaskStats(userId: string): Promise<{
    totalSubmissions: number;
    pendingReview: number;
    approved: number;
    totalEarned: number;
    voiceCount: number;
    imageCount: number;
    videoCount: number;
}> {
    try {
        const { data, error } = await supabase.rpc('get_user_earnings', {
            p_user_id: userId,
        });

        if (error || !data) {
            return {
                totalSubmissions: 0,
                pendingReview: 0,
                approved: 0,
                totalEarned: 0,
                voiceCount: 0,
                imageCount: 0,
                videoCount: 0,
            };
        }

        return {
            totalSubmissions: data.total_submissions || 0,
            pendingReview: data.pending_submissions || 0,
            approved: data.approved_submissions || 0,
            totalEarned: data.total_earned || 0,
            voiceCount: data.voice_count || 0,
            imageCount: data.image_count || 0,
            videoCount: data.video_count || 0,
        };
    } catch (err) {
        console.error('[Stats] Exception:', err);
        return {
            totalSubmissions: 0,
            pendingReview: 0,
            approved: 0,
            totalEarned: 0,
            voiceCount: 0,
            imageCount: 0,
            videoCount: 0,
        };
    }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Generate a new session ID for grouping tasks
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user has completed enough tasks to unlock XUM Judge
 */
export async function checkJudgeUnlock(userId: string): Promise<{
    isUnlocked: boolean;
    completedTasks: number;
    requiredTasks: number;
}> {
    try {
        const stats = await getUserTaskStats(userId);
        const requiredTasks = 10;
        const completedTasks = stats.approved;

        return {
            isUnlocked: completedTasks >= requiredTasks,
            completedTasks,
            requiredTasks,
        };
    } catch (err) {
        return {
            isUnlocked: false,
            completedTasks: 0,
            requiredTasks: 10,
        };
    }
}

// ============================================================================
// MARKETPLACE & HOME FUNCTIONS
// ============================================================================

/**
 * Get active featured promo cards
 */
export async function getFeaturedTasks(): Promise<FeaturedTask[]> {
    try {
        const { data, error } = await supabase
            .from('featured_tasks')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('[Featured] Query error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[Featured] Exception:', err);
        return [];
    }
}

/**
 * Get daily missions for the user
 */
export async function getDailyMissions(userId: string): Promise<AdminTask[]> {
    try {
        const { data, error } = await supabase.rpc('get_daily_missions', {
            p_user_id: userId,
        });

        if (error) {
            console.error('[Missions] RPC error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[Missions] Exception:', err);
        return [];
    }
}

/**
 * Get XUM Judge tasks with unlock status
 */
export async function getXumJudgeTasks(userId: string): Promise<AdminTask[]> {
    try {
        const { data, error } = await supabase.rpc('get_xum_judge_tasks', {
            p_user_id: userId,
        });

        if (error) {
            console.error('[Judge] RPC error:', error);
            return [];
        }

        // The RPC returns { task_data, is_unlocked }. We need to flatten it
        return (data || []).map((item: any) => ({
            ...item.task_data,
            is_unlocked: item.is_unlocked
        }));
    } catch (err) {
        console.error('[Judge] Exception:', err);
        return [];
    }
}

// ============================================================================
// WALLET & TRANS FUNCTIONS
// ============================================================================

/**
 * Get transaction history for user
 */
export async function getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
): Promise<Transaction[]> {
    try {
        const { data, error } = await supabase.rpc('get_transaction_history', {
            p_user_id: userId,
            p_limit: limit,
            p_offset: offset,
        });

        if (error) {
            console.error('[Wallet] RPC error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[Wallet] Exception:', err);
        return [];
    }
}

/**
 * Get current balance for user
 */
export async function getUserBalance(userId: string): Promise<number> {
    try {
        const { data, error } = await supabase.rpc('get_user_balance', {
            p_user_id: userId,
        });

        if (error) {
            console.error('[Balance] RPC error:', error);
            return 0;
        }

        return data || 0;
    } catch (err) {
        console.error('[Balance] Exception:', err);
        return 0;
    }
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(
    userId: string,
    amount: number,
    method: string,
    details: any
): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
        const { data, error } = await supabase.rpc('request_withdrawal', {
            p_user_id: userId,
            p_amount: amount,
            p_payment_method: method,
            p_payment_details: details,
        });

        if (error) {
            console.error('[Withdraw] RPC error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data };
    } catch (err: any) {
        console.error('[Withdraw] Exception:', err);
        return { success: false, error: err.message || 'Withdrawal request failed' };
    }
}

// ============================================================================
// LEADERBOARD FUNCTIONS
// ============================================================================

/**
 * Get global leaderboard
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
        const { data, error } = await supabase
            .from('user_leaderboard')
            .select('*')
            .limit(limit);

        if (error) {
            console.error('[Leaderboard] Query error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[Leaderboard] Exception:', err);
        return [];
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TaskService = {
    // Media & Submissions
    uploadFile,
    submitTask,
    getUserSubmissions,
    getUserTaskStats,

    // Prompts
    getRandomPrompts,
    getPromptById,

    // Home & Marketplace
    getFeaturedTasks,
    getDailyMissions,
    getXumJudgeTasks,

    // Wallet
    getTransactionHistory,
    getUserBalance,
    requestWithdrawal,

    // Other
    getLeaderboard,
    generateSessionId,
    checkJudgeUnlock,
};

export default TaskService;
