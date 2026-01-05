export interface RankingFilter {
    article_id: string | null
    user_id: string | null
    ranking_type: string | null
    ranking_helper: string | null

}

export const RankingFilterHelpers = {
    RankingFilterHasAnyParam(filter: RankingFilter): boolean {
        // console.log ( 'RankingFilterHasAnyParam, filter:', filter )
        return filter.user_id != undefined ||
            filter.article_id != undefined ||
            filter.ranking_helper != undefined ||
            filter.ranking_type != undefined;
    }
}
