import {Request, Response} from "express";
import {RankingFilter, RankingFilterHelpers} from "../types/RankingFilter";
import {RankingRepository} from "../repositories/RankingRepository";
import {RankingSchemaForInsert} from "../entities";
import {ControllerHelper} from "./ControllerHelper";
import {IdGenerator} from "../services/IdGenerator";
import {RankingValidator} from "../services/RankingValidator";
import {z} from "zod";

export class RankingController {
    public constructor(private rankingRepository: RankingRepository,
                       private idGenerator: IdGenerator,
                       private rankingValidator: RankingValidator,
    ) {
    }

    async getRankings2(req: Request, res: Response): Promise<void> {
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
            console.error('Error getting ranking:', error);
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
            console.error('Error updating ranking:', error);

            if (ControllerHelper.handleZodError(error, res)) {
                return
            }

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
            console.error('Error deleting ranking:', error);

            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({error: error.message});
                return;
            }

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
            console.error('Error upserting rankings:', error);

            if (ControllerHelper.handleZodError(error, res)) {
                return;
            }

            res.status(500).json({
                error: 'Failed to upsert rankings',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}