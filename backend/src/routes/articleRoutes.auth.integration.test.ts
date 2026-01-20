import request from 'supertest';
import express from 'express';
import { createArticleRoutes } from './articleRoutes';
import { setupTestDatabase, cleanTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { seedTestData, TEST_ARTICLES, TEST_AUTHORS } from '../test-utils/testData';
import { createConnectionPool } from '../config/database';
import { Pool } from 'mysql2/promise';
import { loadConfig } from '../config';
import { initLogger } from '../logging';
import { TokenService, JwtPayload } from '../services/TokenService';

let testPool: Pool;
let app: express.Application;
let tokenService: TokenService;
let originalAuthEnabled: string | undefined;

describe('Article API Integration Tests - WITH Authentication', () => {
    beforeAll(async () => {
        // Save original AUTH_ENABLED value
        originalAuthEnabled = process.env.AUTH_ENABLED;

        // Enable authentication for this test suite
        process.env.AUTH_ENABLED = 'true';

        const config = loadConfig();
        initLogger({ lokiUrl: config.logging.lokiUrl, environment: 'test' });
        testPool = createConnectionPool(config.database);
        tokenService = new TokenService();

        // Create Express app using the SAME createArticleRoutes function
        app = express();
        app.use(express.json());
        app.use('/api/articles', createArticleRoutes(testPool));

        await waitForDatabase();
        await setupTestDatabase();
    }, 60000);

    beforeEach(async () => {
        await cleanTestDatabase();
        await seedTestData();
    }, 30000);

    afterAll(async () => {
        // Restore original AUTH_ENABLED value
        if (originalAuthEnabled === undefined) {
            delete process.env.AUTH_ENABLED;
        } else {
            process.env.AUTH_ENABLED = originalAuthEnabled;
        }

        await cleanTestDatabase();
        await testPool.end();
    });

    describe('GET /api/articles/:id - WITH Authentication', () => {
        it('should return 200 when valid authentication token is provided', async () => {
            // Generate valid JWT token for test user (id: 1, admin@darbelis.eu)
            const validPayload: JwtPayload = {
                userId: 1,
                email: 'admin@darbelis.eu',
                role: 'admin'
            };
            const validToken = tokenService.generateAccessToken(validPayload);

            const response = await request(app)
                .get(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(TEST_ARTICLES.NODEJS.id);
            expect(response.body.title).toBe(TEST_ARTICLES.NODEJS.title);
            expect(response.body.author_id).toBe(TEST_ARTICLES.NODEJS.author_id);
        });

        it.skip('should return 401 or 403 when invalid authentication token is provided', async () => {
            // Use a completely invalid token (not a valid JWT)
            const invalidToken = 'invalid-token-12345';

            const response = await request(app)
                .get(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
                .set('Authorization', `Bearer ${invalidToken}`);

            // Should return 401 (Unauthorized) or 403 (Forbidden)
            expect([401, 403]).toContain(response.status);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/articles - WITH Authentication', () => {
        it('should assign current user id as article user_id when creating article', async () => {
            // Test with user1 (id: 101)
            const user1Payload: JwtPayload = {
                userId: 101,
                email: 'user1@darbelis.eu',
                role: 'user'
            };
            const user1Token = tokenService.generateAccessToken(user1Payload);

            const article1Data = {
                title: 'Test Article by User 1',
                author_id: TEST_AUTHORS.JOHN.id,
                content: 'This article should have user_id = 101'
            };

            const response1 = await request(app)
                .post('/api/articles')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(article1Data);

            expect(response1.status).toBe(201);
            expect(response1.body).toHaveProperty('id');
            expect(response1.body.title).toBe(article1Data.title);
            expect(response1.body.author_id).toBe(article1Data.author_id);
            expect(response1.body.user_id).toBe(101);  // Should be assigned from token (as number)

            // Test with user2 (id: 102)
            const user2Payload: JwtPayload = {
                userId: 102,
                email: 'user2@darbelis.eu',
                role: 'user'
            };
            const user2Token = tokenService.generateAccessToken(user2Payload);

            const article2Data = {
                title: 'Test Article by User 2',
                author_id: TEST_AUTHORS.JANE.id,
                content: 'This article should have user_id = 102'
            };

            const response2 = await request(app)
                .post('/api/articles')
                .set('Authorization', `Bearer ${user2Token}`)
                .send(article2Data);

            expect(response2.status).toBe(201);
            expect(response2.body).toHaveProperty('id');
            expect(response2.body.title).toBe(article2Data.title);
            expect(response2.body.author_id).toBe(article2Data.author_id);
            expect(response2.body.user_id).toBe(102);  // Should be assigned from token (as number)

            // Verify the articles are stored correctly in database
            const getResponse1 = await request(app)
                .get(`/api/articles/${response1.body.id}`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(getResponse1.status).toBe(200);
            expect(getResponse1.body.user_id).toBe(101);

            const getResponse2 = await request(app)
                .get(`/api/articles/${response2.body.id}`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(getResponse2.status).toBe(200);
            expect(getResponse2.body.user_id).toBe(102);
        });
    });
});
