import {Request, Response} from "express";
import {RankingType} from "../types/RankingType";
import {RankingHelper} from "../types/RankingHelper";

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
            console.error('Error getting ranking types:', error);
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
            console.error('Error getting ranking helpers:', error);
            res.status(500).json({
                error: 'Failed to retrieve ranking helpers',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
