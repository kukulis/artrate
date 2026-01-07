import {createLokiClient} from './LokiClient';

describe('LokiClient', () => {
    it('should write a few messages to Loki', async () => {
        const client = createLokiClient({
            url: 'http://loki:3100'
        });

        // Write some test messages
        let result = await client.info('Test message 1: Application started');
        expect(result).toBeNull()
        result = await client.warn('Test message 2: Warning example');
        expect(result).toBeNull()
        result = await client.error('Test message 3: Error example');
        expect(result).toBeNull()

        console.log('Successfully wrote 3 messages to Loki');
    });
});
