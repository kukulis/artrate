import express from "express";

// import rankingRoutes from "./rankingRoutes";
import request from "supertest";
import {createRankingRoutes} from "./rankingRoutes";
import {createConnectionPool} from "../config/database";
import {Pool} from "mysql2/promise";

let testPool:Pool;
let app: express.Application;

describe('Ranking API Integration Tests', () => {

    beforeAll(async ()=> {
        app = express();
        app.use(express.json());

        testPool = createConnectionPool();
        const rankingRoutes = createRankingRoutes(testPool)
        app.use('/api/rankings', rankingRoutes);
    })

    afterAll(async () => {
        // not needed to clean because database is cleaned before each test
        // and after the test we want to check the data.
        //  await cleanTestDatabase();
        await testPool.end(); // Close connection pool
        // console.log('✅ Integration tests completed\n');
    });

    it('undefined res and req', async ()=>{
        const response = await request(app).get('/api/rankings/failing');
        expect(response.status).toBe(200)
    }, 2000)
})