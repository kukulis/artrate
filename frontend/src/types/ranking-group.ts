import {Ranking} from "./ranking.ts";

export class RankingGroup {
    rankings: Record<string, number>
    helperType: string
    userId: number
    articleId: string

    static createGroup(helperType: string, userId: string, articleId: string, rankingTypes: string[]): RankingGroup | null {

        if (rankingTypes.length == 0) {
            return null;
        }

        const group = new RankingGroup();

        group.helperType = helperType
        group.userId = userId
        group.articleId = articleId
        group.rankings = {}

        for (const rankingType of rankingTypes) {
            group.rankings[rankingType] = 5
        }

        return group;
    }

    static buildGroups(rankings: Ranking[]): RankingGroup[] {
        // TODO
        return [];
    }

    static fillFromGroups(rankings: Ranking[], groups: RankingGroup[])  {
        // TODO
    }


    fillFromRankings(rankings: Ranking[]) {
        // TODO
        for (const ranking of rankings) {
            group.rankings[ranking.ranking_type] = ranking.value
        }
    }

    extractRankings(): Ranking[] {
        // TODO
        return [];
    }

    buildRankingKey(ranking: Ranking): string {
        return ranking.article_id + '__' + ranking.user_id + '__' + ranking.helper_type + '__' + ranking.ranking_type;
    }
}