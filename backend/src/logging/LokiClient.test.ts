import { createLokiClient } from './LokiClient';

describe('LokiClient', () => {
  it('should write a few messages to Loki', async () => {
    const client = createLokiClient({
      url: 'http://localhost:3100'
    });

    // Write some test messages
    await client.info('Test message 1: Application started');
    await client.warn('Test message 2: Warning example');
    await client.error('Test message 3: Error example');

    console.log('Successfully wrote 3 messages to Loki');
  });
});
