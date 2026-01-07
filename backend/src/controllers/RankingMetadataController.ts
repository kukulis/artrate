import {Request, Response} from "express";
import {RankingType} from "../types/RankingType";
import {RankingHelper} from "../types/RankingHelper";
import {logger, wrapError} from "../logging";

/**
 * Controller for ranking metadata endpoints.
 * Handles requests for static ranking configuration data (types and helpers).
 */
export class RankingMetadataController {
    /**
     * Get all available ranking types.
     * @route GET /api/ranking-types
     */
    getRankingTypes = (_req: Request, res: Response): void => {
        try {
            const rankingTypes = RankingType.getAll();
            res.json(rankingTypes);
        } catch (error) {
            logger.error('Error getting ranking types', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve ranking types',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all available ranking helpers.
     * @route GET /api/ranking-helpers
     */
    getRankingHelpers = (_req: Request, res: Response): void => {
        try {
            const rankingHelpers = RankingHelper.getAll();
            res.json(rankingHelpers);
        } catch (error) {
            logger.error('Error getting ranking helpers', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve ranking helpers',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
