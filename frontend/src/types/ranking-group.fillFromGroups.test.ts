import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'
import { Ranking } from './ranking'

describe('RankingGroup.fillFromGroups', () => {
    it('should execute without errors', () => {
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
        const groups: RankingGroup[] = []

        expect(() => {
            RankingGroup.fillFromGroups(rankings, groups)
        }).not.toThrow()
    })
})
