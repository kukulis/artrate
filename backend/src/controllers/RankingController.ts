import {Request, Response} from "express";
import {RankingFilter, RankingFilterHelpers} from "../types/RankingFilter";
import {RankingRepository} from "../repositories/RankingRepository";
import {Ranking} from "../entities";

export class RankingController {
    public constructor(private rankingRepository: RankingRepository) {
    }

    async getRankings2(req: Request, res: Response) : Promise<void> {
        console.log('this:', this)
        // console.log('res', res)
        if ( req == undefined) {
            console.log('req is undefined')
        }
        else {
            console.log('req is IS DEFINED')
        }
        if ( res == undefined) {
            console.log('res is undefined')
            return;
        }
        else {
            console.log('res is DEFINED')
        }

        res.json({laba:'diena'})
    }

    getRankings = async (req: Request, res: Response): Promise<void> => {
        // console.log('RankingController, this: ', this)

        try {
            const rankingFilter = req.query as unknown as RankingFilter
            if (!RankingFilterHelpers.RankingFilterHasAnyParam(rankingFilter)) {
                res.status(400).json({
                    error: 'No search parameters given',
                    message: 'At least one of the parameters must be given: user_id, article_id, ranking_helper, ranking_type.'
                })

                return;
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

    addRanking = async (req: Request, res: Response): Promise<void> => {
        const rankingData =  req.body as Ranking
        try {
            // TODO
            console.log('rankingData', rankingData)
        } catch (error) {
            console.error('Error creating ranking:', error);
            res.status(500).json({
                error: 'Failed to create ranking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }

    }

    // TODO add, update and delete

    // then cover with test
}