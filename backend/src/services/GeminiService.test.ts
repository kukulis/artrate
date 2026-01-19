import * as fs from 'fs';
import path from "path";
import {Ranking} from "../entities";
import {GeminiService} from "./GeminiService";

describe('GeminiService', () => {
    it('extract gemini response', () => {
        const jsonPath = path.join(__dirname, 'data', 'gemini_output.json');
        const jsonData = fs.readFileSync(jsonPath)

        const expectedRankings : Ranking[] = [
            (new Ranking())
                .setRankingType( 'ACCURACY')
                .setValue(7)
                .setDescription("The article presents opinions and observations about online echo chambers and media manipulation, rather than specific, verifiable facts. The accuracy pertains more to the plausibility of the claims, which is moderate."),
            (new Ranking())
                .setRankingType( 'OBJECTIVITY')
                .setValue(6)
                .setDescription("The article expresses opinions and perspectives on societal issues and media influence. While it attempts to present a balanced view, the subjective nature of the observations leans towards moderate objectivity."),
            (new Ranking())
                .setRankingType( 'QUALITY')
                .setValue(7)
                .setDescription("The article is well-structured and easy to follow, with clear paragraphing and a logical flow of ideas. The language is accessible, and the style is consistent."),
            (new Ranking())
                .setRankingType( 'OFFENSIVE')
                .setValue(10)
                .setDescription("The article avoids any language or content that could be considered offensive or marginalizing. It maintains a respectful and neutral tone throughout."),
            (new Ranking())
                .setRankingType( 'LOGICAL')
                .setValue(7)
                .setDescription("The article presents a logical argument about the formation of echo chambers, media manipulation, and the need for objective article evaluation. The reasoning is generally sound, although some claims could benefit from more specific evidence."),
        ];

        const rankings = GeminiService.parseGeminiResponse(jsonData.toString());

        expect(rankings).toStrictEqual(expectedRankings)
    })
})