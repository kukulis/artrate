import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'
import { Ranking } from './ranking'

describe('RankingGroup.buildGroups', () => {
    it('should return an empty array', () => {
        const mockRanking: Ranking = {
            id: '1',
            ranking_type: 'quality',
            helper_type: 'grammar',
            user_id: 123,
            article_id: 'article-1',
            value: 8,
            description: 'Test ranking'
        }

        const rankings: Ranking[] = [mockRanking]
        const result = RankingGroup.buildGroups(rankings)

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
    })
})
