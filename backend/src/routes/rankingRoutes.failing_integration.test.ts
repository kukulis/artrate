import express from "express";

import rankingRoutes from "./rankingRoutes";
import request from "supertest";

const app = express();
app.use(express.json());


app.use('/api/rankings', rankingRoutes);

describe('Ranking API Integration Tests', () => {
    it('undefined res and req', async ()=>{
        const response = await request(app).get('/api/rankings/failing');
        expect(response.status).toBe(200)
    }, 2000)
})