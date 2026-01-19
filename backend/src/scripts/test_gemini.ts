import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { initConfig, getConfig } from '../config';
import { GeminiService } from '../services/GeminiService';
import { GeminiPromptBuilder } from '../services/GeminiPromptBuilder';

dotenv.config();

async function testGemini() {
    // Initialize configuration
    initConfig();
    const config = getConfig();

    // Check if Gemini is configured
    if (!config.gemini.apiKey) {
        console.error('GEMINI_API_KEY not configured in .env');
        process.exit(1);
    }

    console.log(`Using Gemini model: ${config.gemini.model}`);

    // Read article from file
    const articlePath = path.join(__dirname, 'data', 'article_to_test.txt');
    const articleContent = fs.readFileSync(articlePath, 'utf-8');

    console.log(`Read article: ${articleContent.length} characters`);

    // Build prompt using GeminiPromptBuilder
    const builder = new GeminiPromptBuilder();

    // Combine JSON format instruction with questions as the instructions
    const instructions = `${GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION}

${GeminiPromptBuilder.QUESTIONS}`;

    const prompt = builder.buildPrompt({
        article: {
            title: 'Straipsnių vertinimas',
            content: articleContent
        },
        questions: [], // Questions are already included in the QUESTIONS constant
        instructions: instructions
    });

    console.log('--- PROMPT ---');
    console.log(prompt);
    console.log('--- END PROMPT ---');
    console.log(`Prompt length: ${prompt.length} characters`);

    // Create Gemini service and call API
    const geminiService = new GeminiService(
        config.gemini.apiKey,
        config.gemini.model
    );

    console.log('\nCalling Gemini API...');

    try {
        const response = await geminiService.generateContent(prompt);

        // Print metadata to console
        console.log('\n--- RESPONSE METADATA ---');
        console.log(`Finish reason: ${response.finishReason}`);
        if (response.usageMetadata) {
            console.log(`Tokens - Prompt: ${response.usageMetadata.promptTokenCount}, Response: ${response.usageMetadata.candidatesTokenCount}, Total: ${response.usageMetadata.totalTokenCount}`);
        }
        console.log('\n--- RESPONSE TEXT ---');
        console.log(response.text);

        // Write only the response text to file
        const outputPath = path.join(__dirname, 'gemini_output.json');
        fs.writeFileSync(outputPath, response.text, 'utf-8');
        console.log(`\nOutput written to: ${outputPath}`);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        process.exit(1);
    }
}

testGemini();
