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


// TODO helper functions
//
// export interface UniversalInterface {
//     [key: string]: string
// }
//
// export class RankingFilter {
//     public article_id: string | null = null;
//     public user_id: string | null = null;
//     public ranking_type: string | null = null;
//     public ranking_helper: string | null = null;
//
//     initialize(data: UniversalInterface) {
//         this.article_id = data.article_id ?? null
//         this.user_id = data.user_id ?? null
//         this.ranking_type = data.ranking_type ?? null
//         this.ranking_helper = data.ranking_helper ?? null
//     }
//
//     // initialize(data : RankingFilterInterface ) {
//     //     this.article_id = data.article_id ?? null
//     //     this.user_id = data.user_id ?? null
//     //     this.ranking_type = data.ranking_type ?? null
//     //     this.ranking_helper = data.ranking_helper ?? null
//     // }
// }

