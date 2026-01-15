import type { RankingResponse } from './api'

/**
 * Ranking data used within RankingGroup (may or may not have timestamps)
 */
type RankingData = Omit<RankingResponse, 'created_at' | 'updated_at'> & {
    created_at?: string
    updated_at?: string
}

export class RankingGroup {
    rankings: Record<string, RankingData> = {}
    helperType: string = ''
    userId: number = 0
    articleId: string = ''

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

    public setRanking(rankingType: string, ranking: RankingData): RankingGroup {
        this.rankings[rankingType] = ranking

        return this
    }

    public addRanking(ranking: RankingData): RankingGroup {
        this.rankings[ranking.ranking_type] = ranking

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

    static buildGroups(rankings: RankingResponse[]): RankingGroup[] {
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

    fillFromRankings(rankings: RankingData[]) {
        for (const ranking of rankings) {
            this.rankings[ranking.ranking_type] = ranking
        }
    }

    getRankings(): Record<string, RankingData> {
        return this.rankings
    }

    static buildRankingKey(ranking: RankingData): string {
        return ranking.article_id + '__' + ranking.user_id + '__' + ranking.helper_type + '__' + ranking.ranking_type;
    }

    static buildRankingGroupKey(ranking: RankingData): string {
        return ranking.article_id + '__' + ranking.user_id + '__' + ranking.helper_type;
    }

    buildGroupKey(): string {
        return this.articleId + '__' + this.userId + '__' + this.helperType;
    }

    fillMissingRankings(rankingTypes: string[], defaultValue: number) {
        for (const type of rankingTypes) {
            if (this.rankings[type] === undefined) {
                this.rankings[type] = {
                    user_id: this.userId,
                    article_id: this.articleId,
                    helper_type: this.helperType,
                    value: defaultValue,
                    description: '',
                    ranking_type: type,
                    id: '',
                }
            }
        }
    }

    getRankingsCount(): number {
        return Object.keys(this.rankings).length
    }

    buildValuesRepresentation(): string {
        const rezs: string[] = [];
        for (const key in this.rankings) {
            const ranking = this.rankings[key]
            rezs.push(key + ':' + ranking.value)
        }

        return rezs.join('; ')
    }

    getDate(): Date | null {
        for (const rankingKey in this.rankings) {
            const ranking = this.rankings[rankingKey]

            if (ranking.updated_at != null) {
                return new Date(ranking.updated_at)
            }
            if (ranking.created_at != null) {
                return new Date(ranking.created_at)
            }
        }

        return null;
    }
}