# Frontend/Backend Type Sharing Strategy

## Context

When implementing frontend views, developers need to understand backend API data structures. There are two main approaches:

1. **OpenAPI Documentation** - Formal API specification that needs to be read and maintained
2. **Mirrored Type Definitions** - Frontend mirrors backend data structures, providing IDE autocomplete

## Recommendation: Use Approach 2 (Mirrored Types)

For this project, we should mirror backend data structures in the frontend **without** implementing OpenAPI documentation.

## Why Skip OpenAPI (for now)?

**Project characteristics that make types sufficient:**
- Small team / solo developer
- No external API consumers (only our frontend uses backend)
- TypeScript on both ends (compile-time type safety)
- Rapid iteration needed (OpenAPI adds maintenance overhead)
- IDE support already provides autocomplete with TypeScript

**When we would need OpenAPI:**
- Multiple API consumers (mobile app, third-party integrations)
- Public API with external developers
- Code generation for multiple languages
- Contract-first design workflow
- Automated testing tools that rely on OpenAPI specs

## Proposed Implementation

### Backend (already exists)

```typescript
// backend/src/entities/Article.ts
export const CreateArticleSchema = z.object({
    title: z.string(),
    author_id: z.string(),
    content: z.string()
})

export const ArticleSchema = z.object({
    id: z.string(),
    title: z.string(),
    author_id: z.string(),
    content: z.string(),
    user_id: z.number(),
    created_at: z.string(),
    updated_at: z.string()
})

// Export TypeScript types from Zod schemas
export type CreateArticleDTO = z.infer<typeof CreateArticleSchema>
export type ArticleDTO = z.infer<typeof ArticleSchema>
```

### Frontend (to be implemented)

```typescript
// frontend/src/types/api.ts
// Mirror backend DTOs for all API operations

// Article types
export interface CreateArticleRequest {
    title: string
    author_id: string
    content: string
}

export interface UpdateArticleRequest {
    title?: string
    author_id?: string
    content?: string
}

export interface ArticleResponse {
    id: string
    title: string
    author_id: string
    content: string
    user_id: number
    created_at: string
    updated_at: string
}

// Authentication types
export interface LoginRequest {
    email: string
    password: string
    captchaToken?: string
}

export interface LoginResponse {
    user: UserResponse
    accessToken: string
    refreshToken: string
}

export interface UserResponse {
    id: number
    email: string
    name: string
    role: string
}

// Password reset types
export interface PasswordResetRequestRequest {
    email: string
    captchaToken?: string
}

export interface PasswordResetRequestResponse {
    message: string
}

export interface PasswordResetConfirmRequest {
    token: string
    newPassword: string
}

export interface PasswordResetConfirmResponse {
    message: string
}

// ... other API types
```

### Service Layer Usage

```typescript
// frontend/src/services/ArticleService.ts
import type { CreateArticleRequest, ArticleResponse } from '@/types/api'

export class ArticleService {
    async create(data: CreateArticleRequest): Promise<ArticleResponse> {
        const response = await apiClient.post<ArticleResponse>('/articles', data)
        return response.data
    }

    async getById(id: string): Promise<ArticleResponse> {
        const response = await apiClient.get<ArticleResponse>(`/articles/${id}`)
        return response.data
    }
}
```

## Benefits of This Approach

1. **IDE Autocomplete** - TypeScript types provide full IDE support
2. **Type Safety** - Compile-time checking for request/response data
3. **Self-Documenting** - Types serve as inline documentation
4. **No Build Tools** - No OpenAPI code generation needed
5. **Simple Maintenance** - Change types in one place
6. **Faster Development** - No need to maintain separate OpenAPI spec

## Maintenance Discipline

**Critical rule:** When backend schema changes, immediately update corresponding frontend types.

**Workflow:**
1. Change Zod schema in backend
2. Update corresponding TypeScript interface in `frontend/src/types/api.ts`
3. TypeScript compiler will catch any usage issues

## Future Migration Path

If we later need OpenAPI (external consumers, code generation, etc.):
1. Our Zod schemas can generate OpenAPI specs automatically
2. Use tools like `zod-to-openapi` or `@asteasolutions/zod-to-openapi`
3. Migrate gradually without breaking existing code

## Decision

**For now:** Implement approach 2 only (mirrored types in `frontend/src/types/api.ts`)

**Add OpenAPI when:** We have concrete needs like external API consumers or multi-language client generation

## Next Steps

1. Create `frontend/src/types/api.ts` file
2. Define all request/response interfaces for existing API endpoints
3. Update existing *Service classes to use these types
4. Establish convention: always add types when adding new API endpoints
