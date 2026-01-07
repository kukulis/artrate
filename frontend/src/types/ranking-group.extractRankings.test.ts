import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'

describe('RankingGroup.extractRankings', () => {
    it('should return an empty array', () => {
        const group = new RankingGroup()
        const result = group.extractRankings()

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
    })
    it('should return a 5 length array', () => {
        const group = new RankingGroup()

        group.articleId = 'article1'
        group.userId = 1
        group.helperType = 'USER'
        group.rankings = {
            ACCURACY : 6,
            OBJECTIVITY: 7,
            QUALITY: 8,
            OFFENSIVE: 9,
            LOGICAL: 10,
        }

        const expectedRankings: Ranking[] = [
            {
                article_id: 'article1',
                user_id: 1,
                helper_type: 'USER',
                ranking_type: 'ACCURACY',
                value: 6,
            },
            {
                article_id: 'article1',
                user_id: 1,
                helper_type: 'USER',
                ranking_type: 'OBJECTIVITY',
                value: 7,
            },
            {
                article_id: 'article1',
                user_id: 1,
                helper_type: 'USER',
                ranking_type: 'QUALITY',
                value: 8,
            },
            {
                article_id: 'article1',
                user_id: 1,
                helper_type: 'USER',
                ranking_type: 'OFFENSIVE',
                value: 9,
            },
            {
                article_id: 'article1',
                user_id: 1,
                helper_type: 'USER',
                ranking_type: 'LOGICAL',
                value: 10,
            },
        ];

        const result = group.extractRankings()
        expect(result).toEqual(expectedRankings)
    })
})
