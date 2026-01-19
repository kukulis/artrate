import { GeminiPromptBuilder, PromptInput } from './GeminiPromptBuilder';

describe('GeminiPromptBuilder', () => {
    let builder: GeminiPromptBuilder;

    beforeEach(() => {
        builder = new GeminiPromptBuilder();
    });

    it('should build a prompt with all sections', () => {
        const input: PromptInput = {
            article: {
                title: 'Test Article',
                content: 'This is the article content.'
            },
            questions: ['What is the main topic?', 'Who is the author?'],
            instructions: 'Answer the following questions about the article.'
        };

        const result = builder.buildPrompt(input);

        expect(result).toContain('Answer the following questions about the article.');
        expect(result).toContain('## Article');
        expect(result).toContain('Title: Test Article');
        expect(result).toContain('This is the article content.');
        expect(result).toContain('## Questions');
        expect(result).toContain('1. What is the main topic?');
        expect(result).toContain('2. Who is the author?');
    });

    it('should handle single question', () => {
        const input: PromptInput = {
            article: {
                title: 'Single Question Test',
                content: 'Content here.'
            },
            questions: ['Is this valid?'],
            instructions: 'Please answer.'
        };

        const result = builder.buildPrompt(input);

        expect(result).toContain('1. Is this valid?');
        expect(result).not.toContain('2.');
    });

    it('should handle empty questions array', () => {
        const input: PromptInput = {
            article: {
                title: 'No Questions',
                content: 'Some content.'
            },
            questions: [],
            instructions: 'No questions to answer.'
        };

        const result = builder.buildPrompt(input);

        expect(result).toContain('## Questions');
        expect(result).not.toContain('1.');
    });

    it('should preserve multiline article content', () => {
        const multilineContent = `First paragraph.

Second paragraph.

Third paragraph.`;

        const input: PromptInput = {
            article: {
                title: 'Multiline Article',
                content: multilineContent
            },
            questions: ['Summary?'],
            instructions: 'Summarize.'
        };

        const result = builder.buildPrompt(input);

        expect(result).toContain('First paragraph.');
        expect(result).toContain('Second paragraph.');
        expect(result).toContain('Third paragraph.');
    });

    it('should maintain correct section order', () => {
        const input: PromptInput = {
            article: {
                title: 'Order Test',
                content: 'Content.'
            },
            questions: ['Question?'],
            instructions: 'Instructions here.'
        };

        const result = builder.buildPrompt(input);

        const instructionsIndex = result.indexOf('Instructions here.');
        const articleIndex = result.indexOf('## Article');
        const questionsIndex = result.indexOf('## Questions');

        expect(instructionsIndex).toBeLessThan(articleIndex);
        expect(articleIndex).toBeLessThan(questionsIndex);
    });

    describe('JSON_FORMAT_INSTRUCTION', () => {
        it('should contain JSON format requirements', () => {
            const instruction = GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION;

            expect(instruction).toContain('JSON');
            expect(instruction).toContain('rank');
            expect(instruction).toContain('explanation');
        });

        it('should use abstract label format', () => {
            const instruction = GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION;

            expect(instruction).toContain('<LABEL>');
            expect(instruction).toContain('label from each question');
            expect(instruction).toContain('same language as the article');
        });

        it('should specify rank as a number', () => {
            const instruction = GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION;

            expect(instruction).toMatch(/rank.*number/i);
        });

        it('should be usable as instructions parameter', () => {
            const input: PromptInput = {
                article: {
                    title: 'JSON Test',
                    content: 'Article content.'
                },
                questions: ['Rate the quality?'],
                instructions: GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION
            };

            const result = builder.buildPrompt(input);

            expect(result).toContain('JSON');
            expect(result).toContain('<LABEL>');
            expect(result).toContain('## Article');
            expect(result).toContain('1. Rate the quality?');
        });
    });

    describe('QUESTIONS', () => {
        it('should contain all RankingType labels', () => {
            const questions = GeminiPromptBuilder.QUESTIONS;

            expect(questions).toContain('[ACCURACY]');
            expect(questions).toContain('[OBJECTIVITY]');
            expect(questions).toContain('[QUALITY]');
            expect(questions).toContain('[OFFENSIVE]');
            expect(questions).toContain('[LOGICAL]');
        });

        it('should contain Lithuanian question titles', () => {
            const questions = GeminiPromptBuilder.QUESTIONS;

            expect(questions).toContain('Faktų tikslumas');
            expect(questions).toContain('Objektyvumas');
            expect(questions).toContain('Struktūra ir aiškumas');
            expect(questions).toContain('Žurnalistinė etika');
            expect(questions).toContain('Analizė ir logiškumas');
        });
    });
});
