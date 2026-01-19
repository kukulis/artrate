import request from 'supertest';
import express from 'express';
import { createDonationRoutes } from './donationRoutes';
import { setupTestDatabase, cleanTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { createConnectionPool } from '../config/database';
import { Pool } from 'mysql2/promise';
import { loadConfig } from '../config';
import { initLogger } from '../logging';

// Mock paysera-nodejs
jest.mock('paysera-nodejs', () => {
    return jest.fn().mockImplementation(() => ({
        buildRequestUrl: jest.fn().mockReturnValue('https://www.paysera.com/pay?data=test'),
        checkCallback: jest.fn().mockReturnValue(true),
        decode: jest.fn().mockReturnValue({
            orderid: 'test-order-id',
            status: '1',
            requestid: 'paysera-123'
        })
    }));
});

// Create a dedicated pool for this test suite
let testPool: Pool;
let app: express.Application;

describe('Donation API Integration Tests', () => {
    // Setup: Run once before all tests
    beforeAll(async () => {
        const config = loadConfig();
        initLogger({ lokiUrl: config.logging.lokiUrl, environment: 'test' });
        testPool = createConnectionPool(config.database);

        // Create Express app with test-specific pool
        app = express();
        app.use(express.json());
        app.use('/api/donations', createDonationRoutes(testPool));

        await waitForDatabase();
        await setupTestDatabase();
    }, 60000);

    // Clean data before each test
    beforeEach(async () => {
        await cleanTestDatabase();
    }, 30000);

    // Teardown: Clean up after all tests
    afterAll(async () => {
        await cleanTestDatabase();
        await testPool.end();
    });

    describe('POST /api/donations', () => {
        it('should create a new donation with valid data', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 1000, // 10 EUR in cents
                name: 'Test Donor',
                message: 'Keep up the great work!'
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('donation');
            expect(response.body).toHaveProperty('paymentUrl');
            expect(response.body.donation).toHaveProperty('id');
            expect(response.body.donation).toHaveProperty('order_id');
            expect(response.body.donation.amount).toBe(1000);
            expect(response.body.donation.currency).toBe('EUR');
            expect(response.body.donation.status).toBe('pending');
        });

        it('should create donation without optional name and message', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 500 // 5 EUR in cents
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(201);
            expect(response.body.donation).toHaveProperty('id');
            expect(response.body.donation.amount).toBe(500);
        });

        it('should return 400 for missing email', async () => {
            const donation = {
                amount: 1000
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for invalid email', async () => {
            const donation = {
                email: 'invalid-email',
                amount: 1000
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for missing amount', async () => {
            const donation = {
                email: 'donor@example.com'
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 for amount below minimum (less than 1 EUR)', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 50 // 0.50 EUR - below 1 EUR minimum
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return payment URL in response', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 2000
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(201);
            expect(response.body.paymentUrl).toContain('paysera.com');
        });
    });

    describe('GET /api/donations/:orderId/status', () => {
        it('should return donation status for valid order ID', async () => {
            // First create a donation
            const createResponse = await request(app)
                .post('/api/donations')
                .send({
                    email: 'donor@example.com',
                    amount: 1000
                });

            const orderId = createResponse.body.donation.order_id;

            // Then check its status
            const statusResponse = await request(app)
                .get(`/api/donations/${orderId}/status`);

            expect(statusResponse.status).toBe(200);
            expect(statusResponse.body.order_id).toBe(orderId);
            expect(statusResponse.body.status).toBe('pending');
            expect(statusResponse.body.amount).toBe(1000);
            expect(statusResponse.body.currency).toBe('EUR');
        });

        it('should return 404 for non-existent order ID', async () => {
            const response = await request(app)
                .get('/api/donations/non-existent-order-id/status');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/donations/callback', () => {
        it('should return OK for valid callback', async () => {
            const response = await request(app)
                .get('/api/donations/callback')
                .query({
                    data: 'test-data',
                    ss1: 'test-signature-1',
                    ss2: 'test-signature-2'
                });

            // Callback always returns OK to prevent Paysera from retrying
            expect(response.status).toBe(200);
            expect(response.text).toBe('OK');
        });

        it('should return 400 for missing callback parameters', async () => {
            const response = await request(app)
                .get('/api/donations/callback')
                .query({ data: 'test-data' }); // Missing ss1 and ss2

            expect(response.status).toBe(400);
        });
    });

    describe('Integration flow: Create -> Check Status', () => {
        it('should handle complete donation flow', async () => {
            // CREATE donation
            const createResponse = await request(app)
                .post('/api/donations')
                .send({
                    email: 'flow@example.com',
                    amount: 5000, // 50 EUR
                    name: 'Flow Test',
                    message: 'Testing the flow'
                });

            expect(createResponse.status).toBe(201);
            const orderId = createResponse.body.donation.order_id;

            // CHECK status - should be pending
            const statusResponse = await request(app)
                .get(`/api/donations/${orderId}/status`);

            expect(statusResponse.status).toBe(200);
            expect(statusResponse.body.status).toBe('pending');
            expect(statusResponse.body.completed_at).toBeNull();
        });
    });

    describe('Data validation and edge cases', () => {
        it('should handle large donation amounts', async () => {
            const donation = {
                email: 'big-donor@example.com',
                amount: 100000, // 1000 EUR
                name: 'Big Donor'
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(201);
            expect(response.body.donation.amount).toBe(100000);
        });

        it('should handle long message', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 1000,
                message: 'A'.repeat(500) // Long but within 1000 char limit
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(201);
        });

        it('should reject message exceeding max length', async () => {
            const donation = {
                email: 'donor@example.com',
                amount: 1000,
                message: 'A'.repeat(1001) // Exceeds 1000 char limit
            };

            const response = await request(app)
                .post('/api/donations')
                .send(donation);

            expect(response.status).toBe(400);
        });
    });
});
