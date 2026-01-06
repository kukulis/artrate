import {Ranking} from "../entities";
import {RankingRepository} from "../repositories/RankingRepository";
import {RankingFilter} from "../types/RankingFilter";

export class RankingValidator {
    public constructor(private rankingRepository : RankingRepository) {
    }
    public async findDuplicate(ranking: Ranking): Promise<Ranking|null> {

        const rankingFilterData = {
            article_id: ranking.article_id,
            user_id: ranking.user_id,
            ranking_type: ranking.ranking_type,
            ranking_helper: ranking.helper_type,
        }

        const rankingFilter = rankingFilterData as RankingFilter;
        if ( ranking.id != undefined) {
            rankingFilter.not_id = ranking.id
        }

        const existings = await this.rankingRepository.findWithFilter(rankingFilter)

        if ( existings.length > 0 ) {
            return existings[0]
        }

        return null
    }
}