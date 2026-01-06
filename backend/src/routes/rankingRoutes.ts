import { Router } from 'express';
import {RankingController} from "../controllers/RankingController";
import {RankingMetadataController} from "../controllers/RankingMetadataController";
import {RankingRepository} from "../repositories/RankingRepository";
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

  /**
   *  @route   GET /api/rankings
   */
  router.get('/failing', rankingController.getRankings2);
  router.get('/', rankingController.getRankings);
  router.get('/:id', rankingController.getRanking);
  router.post('/', rankingController.addRanking);
  router.put('/upsert', rankingController.upsertRankings);
  router.patch('/:id', rankingController.updateRanking);
  router.delete('/:id', rankingController.deleteRanking);

  return router;
}

/**
 * Create routes for ranking metadata (types and helpers)
 * These are typically mounted at /api level, not under /api/rankings
 */
export function createRankingMetadataRoutes(dbPool: Pool) {
  const router = Router();
  const metadataController = new RankingMetadataController();

  /**
   *  @route   GET /api/ranking-types
   *  @desc    Get all available ranking types
   */
  router.get('/ranking-types', metadataController.getRankingTypes);

  /**
   *  @route   GET /api/ranking-helpers
   *  @desc    Get all available ranking helpers
   */
  router.get('/ranking-helpers', metadataController.getRankingHelpers);

  return router;
}
