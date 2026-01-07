import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'

describe('RankingGroup.createGroup', () => {
    it('should create a RankingGroup with valid parameters', () => {
        const rankingTypes = ['quality', 'accuracy', 'clarity']
        const group = RankingGroup.createGroup('grammar', '123', 'article-1', rankingTypes)

        expect(group).not.toBeNull()
        expect(group?.helperType).toBe('grammar')
        expect(group?.userId).toBe('123')
        expect(group?.articleId).toBe('article-1')
    })

    it('should return null when rankingTypes array is empty', () => {
        const group = RankingGroup.createGroup('grammar', '123', 'article-1', [])

        expect(group).toBeNull()
    })
})
