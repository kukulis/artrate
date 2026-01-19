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

        console.log('\n--- RESPONSE ---');
        console.log(`Finish reason: ${response.finishReason}`);
        if (response.usageMetadata) {
            console.log(`Tokens - Prompt: ${response.usageMetadata.promptTokenCount}, Response: ${response.usageMetadata.candidatesTokenCount}, Total: ${response.usageMetadata.totalTokenCount}`);
        }
        console.log('\nResponse text:');
        console.log(response.text);

        // Parse and write output to JSON file
        const outputPath = path.join(__dirname, 'gemini_output.json');

        let parsedResponse;
        try {
            // Try to parse the response as JSON
            parsedResponse = JSON.parse(response.text);
        } catch {
            // If parsing fails, wrap the text in an object
            parsedResponse = { raw_text: response.text };
        }

        const output = {
            timestamp: new Date().toISOString(),
            model: config.gemini.model,
            finishReason: response.finishReason,
            usageMetadata: response.usageMetadata,
            response: parsedResponse
        };

        fs.writeFileSync(outputPath, JSON.stringify(output, null, 4), 'utf-8');
        console.log(`\nOutput written to: ${outputPath}`);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        process.exit(1);
    }
}

testGemini();
