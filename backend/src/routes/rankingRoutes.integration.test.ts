import express from "express";

import rankingRoutes from "./rankingRoutes";
import request from "supertest";
import {cleanTestDatabase, setupTestDatabase, waitForDatabase} from "../test-utils/dbSetup";
import {seedTestData} from "../test-utils/testData";

const app = express();
app.use(express.json());


app.use('/api/rankings', rankingRoutes);

describe('Ranking API Integration Tests', () => {
    // connection and migrations
    beforeAll(async () => {
        console.log('\n🧪 Setting up integration tests...');
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
       //  await cleanTestDatabase();
        console.log('✅ Integration tests completed\n');
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
    })
})

