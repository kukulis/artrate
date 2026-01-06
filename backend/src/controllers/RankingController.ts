import {Request, Response} from "express";
import {RankingFilter, RankingFilterHelpers} from "../types/RankingFilter";
import {RankingRepository} from "../repositories/RankingRepository";
import {RankingSchemaForInsert} from "../entities";
import {ControllerHelper} from "./ControllerHelper";
import {IdGenerator} from "../services/IdGenerator";
import {RankingValidator} from "../services/RankingValidator";

export class RankingController {
    public constructor(private rankingRepository: RankingRepository,
                       private idGenerator: IdGenerator,
                       private rankingValidator: RankingValidator,
    ) {
    }

    async getRankings2(req: Request, res: Response): Promise<void> {
        console.log('this:', this)
        // console.log('res', res)
        if (req == undefined) {
            console.log('req is undefined')
        } else {
            console.log('req is IS DEFINED')
        }
        if (res == undefined) {
            console.log('res is undefined')
            return;
        } else {
            console.log('res is DEFINED')
        }

        res.json({laba: 'diena'})
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
        try {
            const ranking = RankingSchemaForInsert.parse(req.body);

            ranking.setId(this.idGenerator.nextId())
            // other validations ... ?
            const existing = await this.rankingValidator.findDuplicate(ranking)
            if ( existing != null ) {
                res.status(400).json({
                    error: "There is an existing ranking with same user, article, type and helper and has id "+existing.id,
                })
                return;
            }

            const created = this.rankingRepository.createRanking(ranking)

            res.json(created)
        } catch (error) {
            console.error('Error creating ranking:', error);

            if (ControllerHelper.handleZodError(error, res)) {
                return
            }

            res.status(500).json({
                error: 'Failed to create ranking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }

    }

    // TODO update and delete

    // then cover with test
}