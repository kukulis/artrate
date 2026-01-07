import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'
import { Ranking } from './ranking'

describe('RankingGroup.buildRankingKey', () => {
    it('should build a ranking key from Ranking object', () => {
        const mockRanking: Ranking = {
            id: '1',
            ranking_type: 'quality',
            helper_type: 'grammar',
            user_id: 123,
            article_id: 'article-1',
            value: 8,
            description: 'Test ranking'
        }

        const group = new RankingGroup()
        const key = group.buildRankingKey(mockRanking)

        expect(key).toBe('article-1__123__grammar__quality')
        expect(typeof key).toBe('string')
    })
})
