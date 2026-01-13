import request from 'supertest';
import express from 'express';
import { createArticleRoutes } from './articleRoutes';
import { setupTestDatabase, cleanTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { seedTestData, TEST_ARTICLES } from '../test-utils/testData';
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

        it('should return 401 or 403 when invalid authentication token is provided', async () => {
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
});
