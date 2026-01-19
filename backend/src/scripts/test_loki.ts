import * as dotenv from 'dotenv';
import { LokiClient } from '../logging/LokiClient';

dotenv.config();

async function testLoki() {
    const lokiUrl = process.env.LOKI_URL || 'http://loki:3100';

    console.log(`Testing Loki at: ${lokiUrl}`);

    const defaultLabels = {
        app: 'artcorrect-backend',
        environment: process.env.NODE_ENV || 'development',
    };

    const client = new LokiClient({ url: lokiUrl, defaultLabels });

    try {
        let result = await client.asyncInfo('Test message 1: Application started');
        if (result) {
            console.error('Failed to write info message:', result);
            process.exit(1);
        }
        console.log('✓ Info message sent');

        result = await client.asyncWarn('Test message 2: Warning example');
        if (result) {
            console.error('Failed to write warn message:', result);
            process.exit(1);
        }
        console.log('✓ Warn message sent');

        result = await client.asyncError('Test message 3: Error example');
        if (result) {
            console.error('Failed to write error message:', result);
            process.exit(1);
        }
        console.log('✓ Error message sent');

        console.log('\nSuccessfully wrote 3 messages to Loki');
    } catch (error) {
        console.error('Error connecting to Loki:', error);
        process.exit(1);
    }
}

testLoki();
