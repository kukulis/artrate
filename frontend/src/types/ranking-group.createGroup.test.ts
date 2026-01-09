import {describe, it, expect} from 'vitest'
import {RankingGroup} from './ranking-group'

describe('RankingGroup.createGroup', () => {
    it('should create a RankingGroup with valid parameters', () => {
        const rankingTypes = ['quality', 'accuracy', 'clarity']
        const group = RankingGroup.createGroup('USER', 123, 'article-1', rankingTypes)

        expect(group).not.toBeNull()
        expect(group?.helperType).toBe('USER')
        expect(group?.userId).toBe(123)
        expect(group?.articleId).toBe('article-1')
        expect(group?.rankings).toEqual(
            {
                quality: {
                    id: '',
                    user_id: 123,
                    helper_type: 'USER',
                    article_id: 'article-1',
                    ranking_type: 'quality',
                    value: 5,
                    description: ''
                },
                accuracy: {
                    id: '',
                    user_id: 123,
                    helper_type: 'USER',
                    article_id: 'article-1',
                    ranking_type: 'accuracy',
                    value: 5,
                    description: ''
                },
                clarity: {
                    id: '',
                    user_id: 123,
                    helper_type: 'USER',
                    article_id: 'article-1',
                    ranking_type: 'clarity',
                    value: 5,
                    description: ''
                },
            }
        )
    })

    it('should return null when rankingTypes array is empty', () => {
        const group = RankingGroup.createGroup('grammar', 123, 'article-1', [])

        expect(group).toBeNull()
    })
})
