import {Request, Response} from "express";
import {RankingFilter, RankingFilterHelpers} from "../types/RankingFilter";
import {RankingRepository} from "../repositories/RankingRepository";

export class RankingController {
    // TODO ask about DI in the backend typescript

    private rankingRepository: RankingRepository

    public constructor() {
        this.rankingRepository = new RankingRepository()
    }

     getRankings = async (req: Request, res: Response): Promise<void> => {
        // console.log('RankingController, this: ', this)

        try {
            const rankingFilter = req.query as unknown as RankingFilter
            if (!RankingFilterHelpers.RankingFilterHasAnyParam(rankingFilter)) {
                res.status(400).json({
                    error: 'No search parameters given',
                    message: 'At least user_id must be given'
                })
            }
            const rankings = await this.rankingRepository.findWithFilter(rankingFilter)

            res.json(rankings);
        } catch (error) {
            console.error('Error getting rankings:', error);
            res.status(500).json({
                error: 'Failed to retrieve rankings',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}