import {Request, Response} from "express";
import {RankingFilter, RankingFilterHelpers} from "../types/RankingFilter";
import {RankingRepository} from "../repositories/RankingRepository";
import {RankingSchemaForInsert} from "../entities";
import {ControllerHelper} from "./ControllerHelper";
import {IdGenerator} from "../services/IdGenerator";
import {RankingValidator} from "../services/RankingValidator";
import {z} from "zod";
import {getLogger, wrapError} from "../logging";

const logger = getLogger();

export class RankingController {
    public constructor(private rankingRepository: RankingRepository,
                       private idGenerator: IdGenerator,
                       private rankingValidator: RankingValidator,
    ) {
    }

    async getRankings2(req: Request, res: Response): Promise<void> {
        let message = '';

        if (req == undefined) {
            message = message + 'req is undefined'
        } else {
            message = message + 'req is IS DEFINED'
        }
        if (res == undefined) {
            message = message + 'res is undefined'
            return;
        } else {
            message = message +'res is DEFINED'
        }

        res.json({laba: 'diena ' + message})
    }

    getRankings = async (req: Request, res: Response): Promise<void> => {
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
            logger.error('Error getting rankings', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve rankings',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    getRanking = async (req: Request, res: Response): Promise<void> => {
        const {id} = req.params;
        try {

            const ranking = await this.rankingRepository.findById(id)
            if (!ranking) {
                res.status(404).json({error: 'Ranking not found'});
                return;
            }
            res.json(ranking);
        } catch (error) {
            logger.error('Error getting ranking', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve ranking',
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
            if (existing != null) {
                res.status(400).json({
                    error: "There is an existing ranking with same user, article, type and helper and has id " + existing.id,
                })
                return;
            }

            const created = await this.rankingRepository.createRanking(ranking)

            res.status(201).json(created)
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('ZOD Error creating ranking', wrapError(error));
                return
            }

            logger.error('Error creating ranking', wrapError(error));
            res.status(500).json({
                error: 'Failed to create ranking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }

    }

    updateRanking = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            // Check if ranking exists
            const existingRanking = await this.rankingRepository.findById(id);
            if (!existingRanking) {
                res.status(404).json({error: 'Ranking not found'});
                return;
            }

            const ranking = RankingSchemaForInsert.parse(req.body);

            ranking.setId(id)
            // other validations ... ?
            const existing = await this.rankingValidator.findDuplicate(ranking)
            if (existing != null) {
                res.status(400).json({
                    error: "There is an existing ranking with same user, article, type and helper and has id " + existing.id,
                })
                return;
            }

            const updated = await this.rankingRepository.updateRanking(ranking)

            res.json(updated)
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('ZOD Error updating ranking', wrapError(error));
                return
            }

            logger.error('Error updating ranking', wrapError(error));
            res.status(500).json({
                error: 'Failed to update ranking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    deleteRanking = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            // Check if ranking exists first
            const existingRanking = await this.rankingRepository.findById(id);
            if (!existingRanking) {
                res.status(404).json({error: 'Ranking not found'});
                return;
            }

            await this.rankingRepository.deleteRanking(id)

            res.status(204).send();
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                logger.warn('Error deleting ranking', wrapError(error));
                res.status(404).json({error: error.message});
                return;
            }

            logger.error('Error deleting ranking', wrapError(error));
            res.status(500).json({
                error: 'Failed to delete ranking',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    upsertRankings = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate array of rankings
            const RankingsArraySchema = z.array(RankingSchemaForInsert);
            const rankings = RankingsArraySchema.parse(req.body);

            // Generate IDs for each ranking
            rankings.forEach(ranking => {
                ranking.setId(this.idGenerator.nextId());
            });

            // Upsert all rankings
            await this.rankingRepository.upsertRankings(rankings);

            res.status(200).json({
                message: 'Rankings upserted successfully',
                count: rankings.length
            });
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('ZOD Error upserting rankings', wrapError(error));
                return;
            }

            logger.error('Error upserting rankings', wrapError(error));
            res.status(500).json({
                error: 'Failed to upsert rankings',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}