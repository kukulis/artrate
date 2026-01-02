export class RankingHelper {

    public constructor(
        public readonly code: string,
        public readonly description: string
    ) {
    }

    static readonly USER = new RankingHelper('USER', 'User writes by hand');
    static readonly GEMINI = new RankingHelper('GEMINI', 'AI Gemini');
    static readonly CLAUDESEMANTICS = new RankingHelper('CLAUDESEMANTICS', 'Claude semantics');

    static getAll(): RankingHelper[] {
        return [
            RankingHelper.USER,
            RankingHelper.GEMINI,
            RankingHelper.CLAUDESEMANTICS,
        ]
    }
}