import { RankingRepository } from './RankingRepository';
import { Ranking } from '../entities';
import { createConnectionPool } from '../config/database';
import { cleanTestDatabase, setupTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { seedTestData } from '../test-utils/testData';
import { Pool } from 'mysql2/promise';

let testPool: Pool;
let repository: RankingRepository;

describe('RankingRepository', () => {
    beforeAll(async () => {
        console.log('\n🧪 Setting up RankingRepository tests...');
        testPool = createConnectionPool();
        repository = new RankingRepository(testPool);

        await waitForDatabase();
        await setupTestDatabase();
    }, 60000);

    beforeEach(async () => {
        await cleanTestDatabase();
        await seedTestData();
    }, 30000);

    afterAll(async () => {
        await cleanTestDatabase();
        await testPool.end();
        console.log('✅ RankingRepository tests completed\n');
    });

    describe('upsertRankings', () => {
        it('Should insert new rankings', async () => {
            const newRankings = [
                Object.assign(new Ranking(), {
                    id: 'ranking-new-1',
                    ranking_type: 'OBJECTIVITY',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-3',
                    value: 7,
                    description: 'New ranking 1'
                }),
                Object.assign(new Ranking(), {
                    id: 'ranking-new-2',
                    ranking_type: 'OFFENSIVE',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-3',
                    value: 2,
                    description: 'New ranking 2'
                })
            ];

            await repository.upsertRankings(newRankings);

            // Verify the rankings were inserted
            const ranking1 = await repository.findById('ranking-new-1');
            expect(ranking1).not.toBeNull();
            expect(ranking1!.value).toBe(7);
            expect(ranking1!.description).toBe('New ranking 1');

            const ranking2 = await repository.findById('ranking-new-2');
            expect(ranking2).not.toBeNull();
            expect(ranking2!.value).toBe(2);
            expect(ranking2!.description).toBe('New ranking 2');
        });

        it('Should update existing rankings (value and description only)', async () => {
            // ranking-1 exists: user 101, article-1, OBJECTIVITY, value=5, description='somewhat objective'
            const updatedRankings = [
                Object.assign(new Ranking(), {
                    id: 'ranking-updated-new-id', // New ID, but will match on unique constraint
                    ranking_type: 'OBJECTIVITY',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-1',
                    value: 10,
                    description: 'Updated via upsert'
                })
            ];

            await repository.upsertRankings(updatedRankings);

            // Verify the original ranking was updated
            const ranking = await repository.findById('ranking-1');
            expect(ranking).not.toBeNull();
            expect(ranking!.value).toBe(10);
            expect(ranking!.description).toBe('Updated via upsert');

            // Other fields should remain unchanged
            expect(ranking!.ranking_type).toBe('OBJECTIVITY');
            expect(ranking!.helper_type).toBe('USER');
            expect(ranking!.user_id).toBe('101');
            expect(ranking!.article_id).toBe('article-1');

            // The new ID should not exist as a separate record
            const newIdRanking = await repository.findById('ranking-updated-new-id');
            expect(newIdRanking).toBeNull();
        });

        it('Should handle mixed insert and update operations', async () => {
            const mixedRankings = [
                // Update existing ranking-2 (user 101, article-1, OFFENSIVE)
                Object.assign(new Ranking(), {
                    id: 'ranking-mixed-1',
                    ranking_type: 'OFFENSIVE',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-1',
                    value: 1,
                    description: 'Updated via mixed upsert'
                }),
                // Insert new ranking
                Object.assign(new Ranking(), {
                    id: 'ranking-mixed-2',
                    ranking_type: 'OBJECTIVITY',
                    helper_type: 'AI',
                    user_id: '101',
                    article_id: 'article-4',
                    value: 9,
                    description: 'Inserted via mixed upsert'
                })
            ];

            await repository.upsertRankings(mixedRankings);

            // Verify the update
            const updatedRanking = await repository.findById('ranking-2');
            expect(updatedRanking).not.toBeNull();
            expect(updatedRanking!.value).toBe(1);
            expect(updatedRanking!.description).toBe('Updated via mixed upsert');

            // Verify the insert
            const insertedRanking = await repository.findById('ranking-mixed-2');
            expect(insertedRanking).not.toBeNull();
            expect(insertedRanking!.value).toBe(9);
            expect(insertedRanking!.description).toBe('Inserted via mixed upsert');
        });

        it('Should handle empty array gracefully', async () => {
            await expect(repository.upsertRankings([])).resolves.not.toThrow();
        });

        it('Should update multiple existing rankings in bulk', async () => {
            const bulkUpdates = [
                Object.assign(new Ranking(), {
                    id: 'bulk-1',
                    ranking_type: 'OBJECTIVITY',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-1',
                    value: 8,
                    description: 'Bulk update 1'
                }),
                Object.assign(new Ranking(), {
                    id: 'bulk-2',
                    ranking_type: 'OFFENSIVE',
                    helper_type: 'USER',
                    user_id: '101',
                    article_id: 'article-1',
                    value: 2,
                    description: 'Bulk update 2'
                }),
                Object.assign(new Ranking(), {
                    id: 'bulk-3',
                    ranking_type: 'OBJECTIVITY',
                    helper_type: 'USER',
                    user_id: '102',
                    article_id: 'article-1',
                    value: 7,
                    description: 'Bulk update 3'
                })
            ];

            await repository.upsertRankings(bulkUpdates);

            // Verify all were updated
            const r1 = await repository.findById('ranking-1');
            expect(r1!.value).toBe(8);
            expect(r1!.description).toBe('Bulk update 1');

            const r2 = await repository.findById('ranking-2');
            expect(r2!.value).toBe(2);
            expect(r2!.description).toBe('Bulk update 2');

            const r3 = await repository.findById('ranking-3');
            expect(r3!.value).toBe(7);
            expect(r3!.description).toBe('Bulk update 3');
        });
    });
});
