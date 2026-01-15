import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'
import type { RankingResponse } from './api'

describe('RankingGroup.buildGroups', () => {
    it('should group with a single ranking', () => {
        const rankings: RankingResponse[] = [{
            id: '1',
            ranking_type: 'quality',
            helper_type: 'USER',
            user_id: 123,
            article_id: 'article-1',
            value: 8,
            description: 'Test ranking',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
        }];

        const expectedGroups: RankingGroup[] = [
            (new RankingGroup())
                .setHelperType('USER')
                .setUserId(123)
                .setArticleId('article-1')
                .setRanking('quality', {
                    id: '1',
                    ranking_type: 'quality',
                    helper_type: 'USER',
                    user_id: 123,
                    article_id: 'article-1',
                    value: 8,
                    description: 'Test ranking',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                })
            ,
        ];

        const result: RankingGroup[] = RankingGroup.buildGroups(rankings)

        expect(result).toEqual(expectedGroups)
    });

    it('should get two groups', () => {
        const rankings: RankingResponse[] = [
            {
                id: '1',
                ranking_type: 'quality',
                helper_type: 'USER',
                user_id: 123,
                article_id: 'article-1',
                value: 8,
                description: 'Test ranking',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
            {
                id: '2',
                ranking_type: 'ETHICS',
                helper_type: 'USER',
                user_id: 123,
                article_id: 'article-1',
                value: 7,
                description: 'Test ranking',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
            {
                id: '3',
                ranking_type: 'ETHICS',
                helper_type: 'USER',
                user_id: 123,
                article_id: 'article-2',
                value: 7,
                description: 'Test ranking',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
        ];

        const expectedGroups: RankingGroup[] = [
            (new RankingGroup())
                .setHelperType('USER')
                .setUserId(123)
                .setArticleId('article-1')
                .setRanking('quality', {
                    id: '1',
                    ranking_type: 'quality',
                    helper_type: 'USER',
                    user_id: 123,
                    article_id: 'article-1',
                    value: 8,
                    description: 'Test ranking',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                })
                .setRanking('ETHICS', {
                    id: '2',
                    ranking_type: 'ETHICS',
                    helper_type: 'USER',
                    user_id: 123,
                    article_id: 'article-1',
                    value: 7,
                    description: 'Test ranking',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                })
            ,
            (new RankingGroup())
                .setHelperType('USER')
                .setUserId(123)
                .setArticleId('article-2')
                .setRanking('ETHICS', {
                    id: '3',
                    ranking_type: 'ETHICS',
                    helper_type: 'USER',
                    user_id: 123,
                    article_id: 'article-2',
                    value: 7,
                    description: 'Test ranking',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                })
            ,
        ];

        const result: RankingGroup[] = RankingGroup.buildGroups(rankings)

        expect(result).toEqual(expectedGroups)
    })
})
