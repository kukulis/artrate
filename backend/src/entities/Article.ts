export interface Article {
    id: string;
    title: string;
    author_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export class ArticleHelper {
    static validateForCreate(article: Article): Error | null {
        if (!article.title || !article.author_id || !article.content) {
            return new Error("Missing required fields")
        }

        return null
    }

    static validateForUpdate(article: Article): Error | null {
        if (!article.title && !article.author_id && !article.content) {
            return new Error('At least one field is required for update');
        }

        return null;
    }
}
