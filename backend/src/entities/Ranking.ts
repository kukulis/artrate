import {z} from "zod";
import {RankingType} from "../types";
import {RankingHelper} from "../types/RankingHelper";

export class Ranking {
    public id: string = "";
    public ranking_type: string = RankingType.ACCURACY.code;
    public helper_type: string = RankingHelper.USER.code;
    public user_id: string = "";
    public article_id: string = "";
    public value: number = 0;
    public description: string = "";
    public created_at: Date | null = null;
    public updated_at: Date | null = null;


    setId(value: string): Ranking {
        this.id = value;

        return this;
    }

    setRankingType(value: string): Ranking {
        this.ranking_type = value;

        return this;
    }

    setHelperType(value: string): Ranking {

        this.helper_type = value;

        return this;
    }

    setUserId(value: string): Ranking {
        this.user_id = value;

        return this;

    }

    setArticleId(value: string): Ranking {
        this.article_id = value;

        return this;
    }

    setValue(value: number): Ranking {
        this.value = value;

        return this;
    }

    setDescription(value: string): Ranking {
        this.description = value;

        return this;
    }

    setCreatedAt(value: Date | null): Ranking {
        this.created_at = value;

        return this;
    }

    setUpdatedAt(value: Date | null): Ranking {
        this.updated_at = value;

        return this;
    }
}

// Base schema for validation (can be used with .omit(), .pick(), etc.)
export const RankingSchemaBase = z.object({
    id: z.string(),
    ranking_type: z.string(),
    helper_type: z.string(),
    user_id: z.string(),
    article_id: z.string(),
    value: z.number(),
    description: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
});

export const RankingSchemaForInsert = RankingSchemaBase.omit({
    id: true,
    created_at: true,
    updated_at: true,
})
    .transform((data) => Object.assign(new Ranking(), data))

// Schema for partial updates (all fields optional except id)
export const RankingSchemaForUpdate = RankingSchemaBase.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).partial()

// Schema with transform to Ranking class instance
export const RankingSchema = RankingSchemaBase.transform((data) => Object.assign(new Ranking(), data))

