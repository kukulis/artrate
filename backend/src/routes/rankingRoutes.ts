import { Router } from 'express';
import {RankingController} from "../controllers/RankingController";

const router = Router();
const rankingController = new RankingController()

/**
 *  @route   GET /api/rankings
 */
router.get('/', rankingController.getRankings);


export default router;