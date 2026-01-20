export interface Author {
    id: string;
    name: string;
    description: string;
    user_id?: number;
    created_at: Date;
    updated_at: Date;
}

export class AuthorHelper {
    static validateAndFix(data: Author): Author {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Name is required');
        }
        if (!data.description || data.description.trim().length === 0) {
            throw new Error('Description is required ' + data.description);
        }

        data.name = data.name.trim();
        data.description = data.description.trim()

        return data;
    }
}