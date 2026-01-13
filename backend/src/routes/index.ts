import {Router} from 'express';
import {createArticleRoutes} from './articleRoutes';
import {createAuthorRoutes} from './authorRoutes';
import {createRankingRoutes, createRankingMetadataRoutes} from './rankingRoutes';
import {createUserRoutes} from './userRoutes';
import {createAuthRoutes} from './authRoutes';
import {Pool} from "mysql2/promise";
import {createTestRoutes} from "./testRoutes";

const router = Router();

export function createRouter(pool: Pool): Router {
    router.use('/articles', createArticleRoutes(pool));
    router.use('/authors', createAuthorRoutes(pool));
    router.use('/rankings', createRankingRoutes(pool));
    router.use('/', createRankingMetadataRoutes(pool));
    router.use('/auth', createAuthRoutes(pool));
    router.use('/', createUserRoutes(pool));
    router.use('/test', createTestRoutes())

    return router;
}
