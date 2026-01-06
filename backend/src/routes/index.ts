import {Router} from 'express';
import {createArticleRoutes} from './articleRoutes';
import {createAuthorRoutes} from './authorRoutes';
import {createRankingRoutes, createRankingMetadataRoutes} from './rankingRoutes';
import {createUserRoutes} from './userRoutes';
import {Pool} from "mysql2/promise";

const router = Router();

export function createRouter(pool: Pool): Router {
    router.use('/articles', createArticleRoutes(pool));
    router.use('/authors', createAuthorRoutes(pool));
    router.use('/rankings', createRankingRoutes(pool));
    router.use('/', createRankingMetadataRoutes(pool));
    router.use('/', createUserRoutes());

    return router;
}
