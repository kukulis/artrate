import express from "express";

import rankingRoutes from "./rankingRoutes";
import request from "supertest";
import {pool} from "../config/database";

const app = express();
app.use(express.json());


app.use('/api/rankings', rankingRoutes);

describe('Ranking API Integration Tests', () => {

    afterAll(async () => {
        // not needed to clean because database is cleaned before each test
        // and after the test we want to check the data.
        //  await cleanTestDatabase();
        await pool.end(); // Close connection pool
        console.log('✅ Integration tests completed\n');
    });

    it('undefined res and req', async ()=>{
        const response = await request(app).get('/api/rankings/failing');
        expect(response.status).toBe(200)
    }, 2000)
})