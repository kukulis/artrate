import { z } from 'zod';

// Zod schema for Article
export const ArticleSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    author_id: z.string().min(1, "Author ID is required"),
    content: z.string().min(1, "Content is required"),
    created_at: z.date(),
    updated_at: z.date()
});

// Schema for creating articles (omit generated fields)
export const CreateArticleSchema = ArticleSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
});

// Schema for updating articles (all fields optional, at least one required)
export const UpdateArticleSchema = ArticleSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
}).partial().refine(
    (data) => data.title || data.author_id || data.content,
    { message: "At least one field is required for update" }
);

// TypeScript types inferred from schemas
export type Article = z.infer<typeof ArticleSchema>;
export type CreateArticleDTO = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleDTO = z.infer<typeof UpdateArticleSchema>;
