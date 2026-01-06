import { z } from 'zod';

// Zod schema for Article
export const ArticleSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    author_id: z.string().min(1, "Author ID is required"),
    user_id: z.number(),
    content: z.string().min(1, "Content is required"),
    created_at: z.date(),
    updated_at: z.date()
});

// Schema for creating articles (omit generated fields and user_id - user_id is set by controller)
export const CreateArticleSchema = ArticleSchema.omit({
    id: true,
    user_id: true,  // user_id is set by the controller from authenticated user
    created_at: true,
    updated_at: true
});

// Schema for updating articles (all fields optional, at least one required, user_id cannot be changed)
export const UpdateArticleSchema = ArticleSchema.omit({
    id: true,
    user_id: true,  // user_id cannot be changed after creation
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
