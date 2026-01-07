import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'
import { Ranking } from './ranking'

describe('RankingGroup.fillFromRankings', () => {
    it('should populate rankings from Ranking array', () => {
        const group = new RankingGroup()
        group.rankings = {}

        const rankings: Ranking[] = [
            {
                id: '1',
                ranking_type: 'quality',
                helper_type: 'grammar',
                user_id: 123,
                article_id: 'article-1',
                value: 8,
                description: 'Test ranking'
            },
            {
                id: '2',
                ranking_type: 'accuracy',
                helper_type: 'grammar',
                user_id: 123,
                article_id: 'article-1',
                value: 7,
                description: 'Test ranking 2'
            }
        ]

        group.fillFromRankings(rankings)

        expect(group.rankings['quality']).toBe(8)
        expect(group.rankings['accuracy']).toBe(7)
    })
})
