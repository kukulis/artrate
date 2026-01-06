import express from "express";

import { createRankingRoutes } from "./rankingRoutes";
import request from "supertest";
import {cleanTestDatabase, setupTestDatabase, waitForDatabase} from "../test-utils/dbSetup";
import {seedTestData} from "../test-utils/testData";
import { createConnectionPool } from '../config/database';
import { Pool } from 'mysql2/promise';

// Create a dedicated pool for this test suite
let testPool: Pool;
let app: express.Application;

describe('Ranking API Integration Tests', () => {
    // connection and migrations
    beforeAll(async () => {
        console.log('\n🧪 Setting up Ranking API integration tests...');
        testPool = createConnectionPool();

        // Create Express app with test-specific pool
        app = express();
        app.use(express.json());
        app.use('/api/rankings', createRankingRoutes(testPool));

        await waitForDatabase();
        await setupTestDatabase();
    }, 60000);

    beforeEach(async () => {
        await cleanTestDatabase();
        await seedTestData();
    }, 30000);

    // Teardown: Clean up after all tests
    afterAll(async () => {
        // not needed to clean because database is cleaned before each test
        // and after the test we want to check the data.
        await cleanTestDatabase();
        // Close this test suite's connection pool
        await testPool.end();
        console.log('✅ Ranking API integration tests completed\n');
    });

    describe('GET /api/rankings', () => {
        it( 'Return article Rankings without search parameters', async()=> {
            const response = await request(app).get('/api/rankings');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('No search parameters given')
        });

        it ('Return user 101 rankings', async ()=> {
            const response = await request(app).get('/api/rankings?user_id=101');
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(2); // 2 rankings for user 101
        });

        it ('Return user 101 rankings', async ()=> {
            const response = await request(app).get('/api/rankings?user_id=102');
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(4); // 4 rankings for user 102
        });

        it ('Return article rankings', async ()=> {
            const response = await request(app).get('/api/rankings?article_id=article-1');
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(4); // 2 rankings for article-1
        });
    });

    describe('GET /api/rankings/:id', () => {
        it('Should return a single ranking by id', async () => {
            const response = await request(app).get('/api/rankings/ranking-1');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'ranking-1');
            expect(response.body).toHaveProperty('ranking_type', 'OBJECTIVITY');
            expect(response.body).toHaveProperty('helper_type', 'USER');
            expect(response.body).toHaveProperty('user_id', '101');
            expect(response.body).toHaveProperty('article_id', 'article-1');
            expect(response.body).toHaveProperty('value', 5);
            expect(response.body).toHaveProperty('description', 'somewhat objective');
        });

        it('Should return 404 for non-existent ranking', async () => {
            const response = await request(app).get('/api/rankings/non-existent-id');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('Should return ranking-3 with correct user 102 data', async () => {
            const response = await request(app).get('/api/rankings/ranking-3');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'ranking-3');
            expect(response.body).toHaveProperty('user_id', '102');
            expect(response.body).toHaveProperty('value', 6);
        });
    });

    describe('POST /api/rankings', () => {
        it('Should create a new ranking with valid data', async () => {
            const newRanking = {
                ranking_type: 'OBJECTIVITY',
                helper_type: 'USER',
                user_id: '101',
                article_id: 'article-3',
                value: 8,
                description: 'very objective article'
            };

            const response = await request(app)
                .post('/api/rankings')
                .send(newRanking);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.ranking_type).toBe(newRanking.ranking_type);
            expect(response.body.user_id).toBe(newRanking.user_id);
            expect(response.body.article_id).toBe(newRanking.article_id);
            expect(response.body.value).toBe(newRanking.value);

            // Verify it was actually created by fetching it
            const fetchResponse = await request(app).get(`/api/rankings/${response.body.id}`);
            expect(fetchResponse.status).toBe(200);
            expect(fetchResponse.body.description).toBe(newRanking.description);
        });

        it('Should return 400 when missing required fields', async () => {
            const invalidRanking = {
                ranking_type: 'OBJECTIVITY',
                // missing helper_type, user_id, article_id, value
            };

            const response = await request(app)
                .post('/api/rankings')
                .send(invalidRanking);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('Should create ranking with different ranking types', async () => {
            const offensiveRanking = {
                ranking_type: 'OFFENSIVE',
                helper_type: 'USER',
                user_id: '101',
                article_id: 'article-4',
                value: 2,
                description: 'not offensive at all'
            };

            const response = await request(app)
                .post('/api/rankings')
                .send(offensiveRanking);

            expect(response.status).toBe(201);
            expect(response.body.ranking_type).toBe('OFFENSIVE');
            expect(response.body.value).toBe(2);
        });
    });

    describe('PATCH /api/rankings/:id', () => {
        it('Should update an existing ranking', async () => {
            const updates = {
                ranking_type: 'OBJECTIVITY',
                helper_type: 'USER',
                user_id: '101',
                article_id: 'article-1',
                value: 9,
                description: 'updated description - very objective now'
            };

            const response = await request(app)
                .patch('/api/rankings/ranking-1')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'ranking-1');
            expect(response.body.value).toBe(updates.value);
            expect(response.body.description).toBe(updates.description);

            // Verify the update persisted
            const fetchResponse = await request(app).get('/api/rankings/ranking-1');
            expect(fetchResponse.body.value).toBe(9);
            expect(fetchResponse.body.description).toBe(updates.description);
        });

        it('Should return 404 when updating non-existent ranking', async () => {
            const updates = {
                ranking_type: 'OBJECTIVITY',
                helper_type: 'USER',
                user_id: '101',
                article_id: 'article-1',
                value: 10,
                description: 'this should fail'
            };

            const response = await request(app)
                .patch('/api/rankings/non-existent-id')
                .send(updates);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('Should update value while keeping other fields', async () => {
            const updates = {
                ranking_type: 'OFFENSIVE',
                helper_type: 'USER',
                user_id: '101',
                article_id: 'article-1',
                value: 1,
                description: 'very offensive'
            };

            const response = await request(app)
                .patch('/api/rankings/ranking-2')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.value).toBe(1);
            expect(response.body.user_id).toBe('101');
            expect(response.body.article_id).toBe('article-1');
        });

        it('Should update ranking type and helper type', async () => {
            const updates = {
                ranking_type: 'OBJECTIVITY',
                helper_type: 'AI',
                user_id: '102',
                article_id: 'article-3',
                value: 8,
                description: 'AI-assisted ranking'
            };

            const response = await request(app)
                .patch('/api/rankings/ranking-5')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.ranking_type).toBe('OBJECTIVITY');
            expect(response.body.helper_type).toBe('AI');
            expect(response.body.article_id).toBe('article-3');
        });
    });

    describe('DELETE /api/rankings/:id', () => {
        it('Should delete an existing ranking', async () => {
            // First verify the ranking exists
            const checkResponse = await request(app).get('/api/rankings/ranking-1');
            expect(checkResponse.status).toBe(200);

            // Delete it
            const deleteResponse = await request(app).delete('/api/rankings/ranking-1');
            expect(deleteResponse.status).toBe(204);

            // Verify it's gone
            const verifyResponse = await request(app).get('/api/rankings/ranking-1');
            expect(verifyResponse.status).toBe(404);
        });

        it('Should return 404 when deleting non-existent ranking', async () => {
            const response = await request(app).delete('/api/rankings/non-existent-id');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('Should successfully delete multiple rankings', async () => {
            // Delete ranking-2
            const delete1 = await request(app).delete('/api/rankings/ranking-2');
            expect(delete1.status).toBe(204);

            // Delete ranking-3
            const delete2 = await request(app).delete('/api/rankings/ranking-3');
            expect(delete2.status).toBe(204);

            // Verify both are gone
            const verify1 = await request(app).get('/api/rankings/ranking-2');
            expect(verify1.status).toBe(404);

            const verify2 = await request(app).get('/api/rankings/ranking-3');
            expect(verify2.status).toBe(404);
        });

        it('Should not affect other rankings when deleting one', async () => {
            // Delete ranking-4
            await request(app).delete('/api/rankings/ranking-4');

            // Verify ranking-5 still exists
            const response = await request(app).get('/api/rankings/ranking-5');
            expect(response.status).toBe(200);
            expect(response.body.id).toBe('ranking-5');
        });
    });
})

