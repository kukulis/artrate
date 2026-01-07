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

        const key = RankingGroup.buildRankingKey(mockRanking)

        expect(key).toBe('article-1__123__grammar__quality')
        expect(typeof key).toBe('string')
    })

    it('should build a ranking key from Ranking group object', () => {
        const mockRanking: Ranking = {
            id: '1',
            ranking_type: 'quality',
            helper_type: 'USER',
            user_id: 123,
            article_id: 'article-1',
            value: 8,
            description: 'Test ranking'
        }

        const key = RankingGroup.buildRankingGroupKey(mockRanking)

        expect(key).toBe('article-1__123__USER')
        expect(typeof key).toBe('string')
    })

    it('should build a group key', () => {
        const group = new RankingGroup();

        group.articleId = 'article_1'
        group.userId = 123
        group.helperType = 'USER'
        const key = group.buildGroupKey();

        expect(key).toBe('article_1__123__USER')
    })
})
