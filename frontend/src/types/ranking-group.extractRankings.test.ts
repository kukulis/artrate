import { describe, it, expect } from 'vitest'
import { RankingGroup } from './ranking-group'

describe('RankingGroup.extractRankings', () => {
    it('should return an empty array', () => {
        const group = new RankingGroup()
        const result = group.extractRankings()

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
    })
})
