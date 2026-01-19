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
                .setRankingType('ACCURACY')
                .setValue(6)
                .setDescription("Straipsnyje pateikiami teiginiai apie nuomonių burbulus ir jų įtaką visuomenei. Nors tai yra plačiai paplitęs reiškinys, straipsnyje nėra jokių konkrečių duomenų ar nuorodų į šaltinius, patvirtinančius šiuos teiginius. Todėl faktų tikslumas vertinamas vidutiniškai."),
            (new Ranking())
                .setRankingType('OBJECTIVITY')
                .setValue(5)
                .setDescription("Straipsnis išreiškia autoriaus nuomonę apie nuomonių burbulus ir jų įtaką visuomenei bei straipsnių vertinimą. Nors autorius pripažįsta, kad radikali pasaulėžiūra nebūtinai yra blogis, didžioji dalis teksto yra pagrįsta autoriaus subjektyviais pastebėjimais ir nuomone. Pateikiamos įvairios nuomonės, tačiau straipsnis linkęs į autoriaus poziciją."),
            (new Ranking())
                .setRankingType('QUALITY')
                .setValue(7)
                .setDescription("Straipsnio struktūra yra gana aiški, tekste naudojamas suprantamas žodynas. Stilius yra neformaliai publicistinis. Tekstas skaitomas lengvai, tačiau galėtų būti labiau struktūruotas, naudojant poskyrius ir aiškiau išdėstant argumentus."),
            (new Ranking())
                .setRankingType('OFFENSIVE')
                .setValue(10)
                .setDescription("Straipsnyje nėra jokios informacijos, kuri būtų puolanti ar marginalizuojanti atskirus žmones ar grupes. Bendras teksto tonas yra neutralus ir pagarbus."),
            (new Ranking())
                .setRankingType('LOGICAL')
                .setValue(6)
                .setDescription("Straipsnyje pateikiami argumentai dėl nuomonių burbulų įtakos ir straipsnių vertinimo. Argumentai nėra labai išsamūs ir kai kurie teiginiai yra pagrįsti labiau prielaidomis nei loginiu samprotavimu. Vis dėlto, bendras analizės lygis yra pakankamas, nors ir nėra labai išsamus."),
        ];

        const rankings = GeminiService.parseGeminiResponse(jsonData.toString());

        expect(rankings).toStrictEqual(expectedRankings)
    })

    it('extract gemini response from raw markdown format', () => {
        // This is the format returned directly from geminiService.generateContent().text
        const rawMarkdownResponse = `\`\`\`json
{
    "ACCURACY": { "rank": 8, "explanation": "Facts are accurate." },
    "OBJECTIVITY": { "rank": 7, "explanation": "Mostly objective." }
}
\`\`\``;

        const expectedRankings: Ranking[] = [
            (new Ranking())
                .setRankingType('ACCURACY')
                .setValue(8)
                .setDescription("Facts are accurate."),
            (new Ranking())
                .setRankingType('OBJECTIVITY')
                .setValue(7)
                .setDescription("Mostly objective."),
        ];

        const rankings = GeminiService.parseGeminiResponse(rawMarkdownResponse);

        expect(rankings).toStrictEqual(expectedRankings);
    })

    it('extract gemini response from plain JSON format', () => {
        // When Gemini returns clean JSON without markdown fences
        const plainJsonResponse = `{
    "ACCURACY": { "rank": 9, "explanation": "Very accurate." },
    "QUALITY": { "rank": 6, "explanation": "Decent quality." }
}`;

        const expectedRankings: Ranking[] = [
            (new Ranking())
                .setRankingType('ACCURACY')
                .setValue(9)
                .setDescription("Very accurate."),
            (new Ranking())
                .setRankingType('QUALITY')
                .setValue(6)
                .setDescription("Decent quality."),
        ];

        const rankings = GeminiService.parseGeminiResponse(plainJsonResponse);

        expect(rankings).toStrictEqual(expectedRankings);
    })
})