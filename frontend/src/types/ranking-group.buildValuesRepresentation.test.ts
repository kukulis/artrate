import {describe, expect, it} from "vitest";
import {RankingGroup} from "./ranking-group.ts";

describe('RankingGroup.buildValuesRepresentation', () => {
    it('empty string for group without rankings', () => {
        const group = new RankingGroup()
        const representation =  group.buildValuesRepresentation()

        expect(representation).toBe('')
    })
    it('normal string for normal group', () => {
        const group = new RankingGroup()

        group.setRanking(
            'OBJECTIVITY',
            {
                value:5,
            }
        )
        group.setRanking(
            'ACCURACY',
            {
                value:4,
            }
        )
        group.setRanking(
            'LOGIC',
            {
                value:6,
            }
        )
        group.setRanking(
            'QUALITY',
            {
                value:6,
            }
        )
        group.addRanking(
            {
                ranking_type: 'OFFENSIVE',
                value:3,
            }
        )
        const representation =  group.buildValuesRepresentation()

        console.log('ranking-group.buildValuesRepresentation.test: representation='+representation)

        expect(representation).toEqual('OBJECTIVITY:5; ACCURACY:4; LOGIC:6; QUALITY:6; OFFENSIVE:3')
    })
})
