import {Ranking, RankingSchema, RankingSchemaBase} from "./Ranking";

describe('Ranking', () => {
    describe('Parse', () => {
        it('Should parse complete data to a Ranking object using RankingSchema', () => {
            const ranking = RankingSchema.parse({
                id: 'ranking-1',
                ranking_type: 'OBJECTIVE',
                helper_type: 'USER',
                user_id: 'user-1',
                article_id: 'article-1',
                value: 10,
                description: "belenkas",
                created_at: new Date(),
                updated_at: new Date(),
            })

            expect(ranking).toBeInstanceOf(Ranking)
            expect(ranking.id).toBe('ranking-1')
            expect(ranking.value).toBe(10)
        })

        it('Should parse partial data to a Ranking object using RankingSchemaBase', () => {
            const ranking = RankingSchemaBase
                .omit({
                    id: true,
                    created_at: true,
                    updated_at: true,
                })
                .transform((data) => Object.assign(new Ranking(), data))
                .parse({
                    ranking_type: 'OBJECTIVE',
                    helper_type: 'USER',
                    user_id: 'user-1',
                    article_id: 'article-1',
                    value: 10,
                    description: "belenkas",
                })

            expect(ranking).toBeInstanceOf(Ranking)
            expect(ranking.value).toBe(10)
        })
    })
})