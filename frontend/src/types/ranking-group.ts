import {Ranking} from "./ranking.ts";

export class RankingGroup {
    // rankings: Record<string, number> = {}
    rankings: Record<string, Ranking> = {}
    helperType: string
    userId: number
    articleId: string

    public setHelperType(helperType: string): RankingGroup {
        this.helperType = helperType;

        return this
    }

    public setUserId(userId: number): RankingGroup {
        this.userId = userId;

        return this
    }

    public setArticleId(articleId: string): RankingGroup {
        this.articleId = articleId;

        return this
    }

    public setRanking(rankingType: string, ranking: Ranking): RankingGroup {
        this.rankings[rankingType] = ranking

        return this
    }


    static createGroup(helperType: string, userId: number, articleId: string, rankingTypes: string[]): RankingGroup | null {
        if (rankingTypes.length == 0) {
            return null;
        }

        const group = new RankingGroup();

        group.helperType = helperType
        group.userId = userId
        group.articleId = articleId
        group.rankings = {}

        for (const rankingType of rankingTypes) {
            group.rankings[rankingType] = {
                id: '',
                user_id: userId,
                article_id: articleId,
                ranking_type: rankingType,
                helper_type: helperType,
                value: 5,
                description: ''
            }
        }

        return group;
    }

    static buildGroups(rankings: Ranking[]): RankingGroup[] {
        const groupsMap: Record<string, RankingGroup> = {};

        for (const ranking of rankings) {
            const groupKey = RankingGroup.buildRankingGroupKey(ranking);

            if (!groupsMap[groupKey]) {
                groupsMap[groupKey] = new RankingGroup()
                    .setHelperType(ranking.helper_type)
                    .setUserId(ranking.user_id)
                    .setArticleId(ranking.article_id);
            }

            groupsMap[groupKey].setRanking(ranking.ranking_type, ranking);
        }

        return Object.values(groupsMap);
    }

    fillFromRankings(rankings: Ranking[]) {
        // may be need to validate other fields
        for (const ranking of rankings) {
            this.rankings[ranking.ranking_type] = ranking
        }
    }

    getRankings(): Ranking[] {
        return this.rankings
    }

    static buildRankingKey(ranking: Ranking): string {
        return ranking.article_id + '__' + ranking.user_id + '__' + ranking.helper_type + '__' + ranking.ranking_type;
    }

    static buildRankingGroupKey(ranking: Ranking): string {
        return ranking.article_id + '__' + ranking.user_id + '__' + ranking.helper_type;
    }

    buildGroupKey(): string {
        return this.articleId + '__' + this.userId + '__' + this.helperType;
    }

    fillMissingRankings(rankingTypes: string [], defaultValue: int) {
        for (const type of rankingTypes) {
            if (this.rankings [type] === undefined) {
                this.rankings[type] = defaultValue
            }
        }
    }
}