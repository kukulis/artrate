import { Router } from 'express';
import {RankingController} from "../controllers/RankingController";
import {RankingMetadataController} from "../controllers/RankingMetadataController";
import {RankingRepository} from "../repositories/RankingRepository";
import {UserRepository} from "../repositories/UserRepository";
import {TokenService} from "../services/TokenService";
import {authenticateToken} from "../middleware/authMiddleware";
import { Pool } from 'mysql2/promise';
import {RandomIdGenerator} from "../services/RandomIdGenerator";
import {RankingValidator} from "../services/RankingValidator";

/**
 * Create ranking routes with a given connection pool
 * This allows tests to inject their own pool for better isolation
 */
export function createRankingRoutes(dbPool: Pool) {
    const router = Router();
    const rankingRepository = new RankingRepository(dbPool)
    const idGenerator = new RandomIdGenerator()
    const rankingValidator = new RankingValidator(rankingRepository)
    const rankingController = new RankingController(rankingRepository, idGenerator, rankingValidator)

    // Create authentication middleware
    const userRepository = new UserRepository(dbPool);
    const tokenService = new TokenService();
    const authMiddleware = authenticateToken(userRepository, tokenService);

    /**
     *  @route   GET /api/rankings
     *  @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.get('/failing', authMiddleware, rankingController.getRankings2);
    router.get('/', authMiddleware, rankingController.getRankings);
    router.get('/:id', authMiddleware, rankingController.getRanking);
    router.post('/', authMiddleware, rankingController.addRanking);
    router.put('/upsert', authMiddleware, rankingController.upsertRankings);
    router.patch('/:id', authMiddleware, rankingController.updateRanking);
    router.delete('/:id', authMiddleware, rankingController.deleteRanking);

    return router;
}

/**
 * Create routes for ranking metadata (types and helpers)
 * These are typically mounted at /api level, not under /api/rankings
 */
export function createRankingMetadataRoutes(dbPool: Pool) {
    const router = Router();
    const metadataController = new RankingMetadataController();

    // Create authentication middleware
    const userRepository = new UserRepository(dbPool);
    const tokenService = new TokenService();
    const authMiddleware = authenticateToken(userRepository, tokenService);

    /**
     *  @route   GET /api/ranking-types
     *  @desc    Get all available ranking types
     *  @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.get('/ranking-types', authMiddleware, metadataController.getRankingTypes);

    /**
     *  @route   GET /api/ranking-helpers
     *  @desc    Get all available ranking helpers
     *  @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.get('/ranking-helpers', authMiddleware, metadataController.getRankingHelpers);

    return router;
}
