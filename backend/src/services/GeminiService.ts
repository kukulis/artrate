import axios from 'axios';
import { getLogger, wrapError } from '../logging';

const logger = getLogger();

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GeminiResponse {
    text: string;
    finishReason: string;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

export class GeminiService {
    private apiKey: string;
    private model: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    constructor(apiKey?: string, model?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        this.model = model || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    }

    isConfigured(): boolean {
        return this.apiKey !== '';
    }

    async generateContent(prompt: string): Promise<GeminiResponse> {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key not configured');
        }

        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

        try {
            const response = await axios.post(url, {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            });

            const candidate = response.data.candidates?.[0];
            if (!candidate) {
                throw new Error('No response candidates from Gemini API');
            }

            return {
                text: candidate.content?.parts?.[0]?.text || '',
                finishReason: candidate.finishReason || 'UNKNOWN',
                usageMetadata: response.data.usageMetadata
            };
        } catch (error) {
            logger.error('Error calling Gemini API', wrapError(error));
            throw error;
        }
    }

    async generateChat(messages: GeminiMessage[]): Promise<GeminiResponse> {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key not configured');
        }

        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

        try {
            const response = await axios.post(url, {
                contents: messages.map(msg => ({
                    role: msg.role,
                    parts: msg.parts
                }))
            });

            const candidate = response.data.candidates?.[0];
            if (!candidate) {
                throw new Error('No response candidates from Gemini API');
            }

            return {
                text: candidate.content?.parts?.[0]?.text || '',
                finishReason: candidate.finishReason || 'UNKNOWN',
                usageMetadata: response.data.usageMetadata
            };
        } catch (error) {
            logger.error('Error calling Gemini chat API', wrapError(error));
            throw error;
        }
    }
}
