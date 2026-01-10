import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables before running tests
// Use override: true to replace existing environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env.test'),
  override: true
});

// beforeAll(() => {
//   // jest.spyOn(console, 'log').mockImplementation();
//   jest.spyOn(console, 'warn').mockImplementation();
//   // Keep console.error for debugging
// });
