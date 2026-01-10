import {LokiClient} from "./LokiClient";


describe('LokiClient', () => {
    it('should write a few messages to Loki', async () => {

        const defaultLabels = {
            app: 'artcorrect-backend',
            environment: process.env.NODE_ENV || 'development',
        };

        const client = new LokiClient({url:'http://loki:3100', defaultLabels});

        // Write some test messages
        let result = await client.asyncInfo('Test message 1: Application started');
        expect(result).toBeNull()
        result = await client.asyncWarn('Test message 2: Warning example');
        expect(result).toBeNull()
        result = await client.asyncError('Test message 3: Error example');
        expect(result).toBeNull()

        console.log('Successfully wrote 3 messages to Loki');
    });
});
