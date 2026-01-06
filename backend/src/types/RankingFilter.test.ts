import {RankingFilter, RankingFilterHelpers} from "./RankingFilter";

describe('RankingFilter', () => {
    describe('RankingFilterHasAnyParam', () => {
        // Test valid ranking filter
        describe('Checking when ranking filter has at leas one parameter', () => {
            it('should return true for structure with given "user_id"', () => {
                const rankingFilter = {user_id: 101} as RankingFilter
                expect( RankingFilterHelpers.RankingFilterHasAnyParam(rankingFilter)).toBe(true);
            });
        })
    })
})