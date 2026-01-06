import { Router } from 'express';
import {RankingController} from "../controllers/RankingController";
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
