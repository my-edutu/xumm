/**
 * XUM Linguasense Dataset Exporter
 * Converts validated human grounding data into AI-trainable formats.
 */

import { LinguasenseTask } from '../../types';

interface LinguasenseResponse {
    id: string;
    taskId: string;
    textInput: string;
    audioUrl?: string;
    consensusScore: number;
    language: string;
}

export const exportToJSONL = (responses: LinguasenseResponse[]): string => {
    return responses
        .filter(r => r.consensusScore >= 0.85) // Only ultra-pure, verified data
        .map(r => JSON.stringify({
            instruction: `Translate or explain the following ${r.language} expression:`,
            input: r.textInput,
            output: `Consensus grounding: ${r.textInput}. Contextually validated with ${Math.floor(r.consensusScore * 100)}% agreement.`,
            metadata: {
                response_id: r.id,
                task_id: r.taskId,
                audio_ref: r.audioUrl
            }
        }))
        .join('\n');
};

export const exportToCSV = (responses: LinguasenseResponse[]): string => {
    const header = "id,taskId,language,textInput,consensusScore\n";
    const rows = responses.map(r =>
        `${r.id},${r.taskId},${r.language},"${r.textInput.replace(/"/g, '""')}",${r.consensusScore}`
    ).join('\n');
    return header + rows;
};
