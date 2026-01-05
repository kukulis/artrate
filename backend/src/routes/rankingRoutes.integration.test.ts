import express from "express";

import rankingRoutes from "./rankingRoutes";
import request from "supertest";
import {setupTestDatabase, waitForDatabase} from "../test-utils/dbSetup";

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

    // TODO fixtures



    describe('GET /api/rankings', () => {
        it( 'Return article Rankings', async()=> {
            console.log('Error response without any search parameters')
            const response = await request(app).get('/api/rankings');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('No search parameters given')
        })
    })
})

