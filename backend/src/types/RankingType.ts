/**
 * RankingType represents a type of ranking/rating in the system.
 * This is a value object with a fixed set of valid instances.
 */
export class RankingType {
    private constructor(
        public readonly code: string,
        public readonly description: string,
        public readonly details_lt: string,
    ) {
    }

    static readonly ACCURACY = new RankingType(
        'ACCURACY',
        'Accuracy Rating',
        '**Faktų tikslumas** Prašome įvertinti šį straipsnį pagal faktų tikslumą skalėje nuo 1 iki 10, kur 1 yra labai netikslūs faktai, o 10 yra labai tikslūs. Atkreipkite dėmesį tik į straipsnyje pateiktą informaciją, nesiremdami išoriniais šaltiniais. *Pavyzdžiai: labai netikslūs faktai gali būti akivaizdžiai klaidingi, o labai tikslūs - paremti patikimais šaltiniais.',
    );

    // Group 1
    static readonly OBJECTIVITY = new RankingType(
        'OBJECTIVITY',
        'Is an article Objective? Use of evidence and citations.',
        '**Objektyvumas** Prašome įvertinti šį straipsnį pagal objektyvumą skalėje nuo 1 iki 10, kur 1 reiškia, kad straipsnis yra labai subjektyvus ir šališkas, o 10 reiškia, kad straipsnis yra visiškai objektyvus ir neutralaus pobūdžio. Atkreipkite dėmesį tik į straipsnyje pateiktą informaciją, nesiremdami išoriniais šaltiniais. *Objektyvumas gali būti vertinamas pagal tai, kaip gerai straipsnis pateikia įvairias nuomones.',
    );

    // Group 1
    static readonly QUALITY = new RankingType(
        'QUALITY',
        'Quality Rating',
        '**Struktūra ir aiškumas** Prašome įvertinti straipsnio struktūrą, žodyno ir stiliaus kokybę, atsižvelgiant į aiškumą ir skaitomumą, naudojant skalę nuo 1 iki 10, kur 1 reiškia, kad struktūra, žodynas ir stilius yra neaiškūs, sunkiai suprantami arba netinkami, o 10 – kad jie yra aiškūs, sklandūs ir profesionalūs. Atkreipkite dėmesį tik į straipsnyje pateiktą informaciją, nesiremdami išoriniais šaltiniais. *Skaitomumas apima ne tik aiškumą, bet ir gramatiką bei stiliaus nuoseklumą.',
    );

    // Group 1
    static readonly OFFENSIVE = new RankingType(
        'OFFENSIVE',
        'Is an article Offensive? Presence of hedging words (maybe, might, could) vs definitive claims.',
        '**Žurnalistinė etika** Kaip galima objektyviai įvertinti straipsnio etiškumą, atsižvelgiant į žurnalistinės etikos principus, ypač kalbant apie atskirų žmonių ar grupių marginalizavimą? Prašome įvertinti, kiek svarbu etikos vertinime akcentuoti bendrą teksto toną ir pagarbą, naudojant skalę nuo 1 iki 10, kur 1 reiškia, kad straipsnyje akcentuojamas atskirų grupių puolimas ir marginalizavimas, o 10 – kad bendras kontekstas ir pagarbos išlaikymas yra kur kas svarbesni. *Atskirtų neigiamų žodžių, pvz., \'negras\', naudojimas būtų įvertinamas atsižvelgiant į vartojimo neutralumą be neigiamo emocinio konteksto.',
    );

    // Group 1
    static readonly LOGICAL = new RankingType(
        'LOGICAL',
        "Is an article Logical? Doesn't it contain inner contradictions?",
        '**Analizė ir logiškumas** Prašome įvertinti straipsnio analizės kokybę, atsižvelgiant į loginių išvadų sudarymą, argumentų ryšius ir loginių prieštaravimų aptikimą, naudojant skalę nuo 1 iki 10, kur 1 reiškia, kad analizė yra paviršutiniška ir be loginių ryšių, o 10 – kad ji yra išsami, gerai struktūruota, pagrįsta logišku samprotavimu ir gebanti atpažinti bei spręsti loginius prieštaravimus. Atkreipkite dėmesį tik į straipsnyje pateiktą informaciją, nesiremdami išoriniais šaltiniais.',
    );

    static readonly GRAMMAR = new RankingType(
        'GRAMMAR',
        'Grammar Rating',
        '',
    );

    static readonly STYLE = new RankingType(
        'STYLE',
        'Style Rating',
        '',
    );

    static readonly RELEVANCE = new RankingType(
        'RELEVANCE',
        'Relevance Rating',
        '',
    );

    static readonly BALANCED = new RankingType(
        'BALANCED',
        'Balance of viewpoints. If the particular opinion is not declared as an absolute truth?',
        '',
    );

    static readonly EMOTIONAL = new RankingType(
        'EMOTIONAL',
        'Use of factual vs emotional language.',
        '',
    );

    // ============================================================
    // Helper methods
    // ============================================================

    /**
     * Get all valid ranking types.
     * @returns Array of all RankingType instances
     */
    static getAll(): RankingType[] {
        return [
            RankingType.ACCURACY,
            RankingType.QUALITY,
            RankingType.GRAMMAR,
            RankingType.STYLE,
            RankingType.RELEVANCE,
            RankingType.OBJECTIVITY,
            RankingType.OFFENSIVE,
            RankingType.LOGICAL,
            RankingType.BALANCED,
            RankingType.EMOTIONAL,
        ];
    }

    static getAllGroup1(): RankingType[] {
        return [
            RankingType.ACCURACY,
            RankingType.OBJECTIVITY,
            RankingType.QUALITY,
            RankingType.OFFENSIVE,
            RankingType.LOGICAL,
        ];
    }

    /**
     * Find a RankingType by its code.
     * @param code - The ranking type code (e.g., 'ACCURACY')
     * @returns The matching RankingType or undefined if not found
     */
    static fromCode(code: string): RankingType | undefined {
        return RankingType.getAll().find(rt => rt.code === code);
    }

    /**
     * Check if a code is a valid ranking type.
     * @param code - The code to validate
     * @returns true if the code matches a valid ranking type
     */
    static isValid(code: string): boolean {
        return RankingType.getAll().some(rt => rt.code === code);
    }

    /**
     * Get all valid ranking type codes.
     * @returns Array of all valid codes
     */
    static getCodes(): string[] {
        return RankingType.getAll().map(rt => rt.code);
    }

    // ============================================================
    // Instance methods
    // ============================================================

    /**
     * Check if this ranking type equals another.
     * @param other - Another RankingType to compare
     * @returns true if they have the same code
     */
    equals(other: RankingType): boolean {
        return this.code === other.code;
    }

    /**
     * String representation of this ranking type.
     * @returns Formatted string with code and description
     */
    toString(): string {
        return `${this.code}: ${this.description}`;
    }

    /**
     * Convert to a plain object for JSON serialization.
     * @returns Plain object with code and description
     */
    toJSON(): { code: string; description: string } {
        return {
            code: this.code,
            description: this.description
        };
    }
}
