export interface AuthorFilter {
    author_id?: string | null;           // Find by exact ID
    name?: string | null;                // Find by exact name
    name_part?: string | null;           // Search by partial name (LIKE)
}

export const AuthorFilterHelpers = {
    /**
     * Check if filter has any search parameters
     */
    hasAnyParam(filter: AuthorFilter): boolean {
        return filter.author_id !== undefined && filter.author_id !== null ||
               filter.name !== undefined && filter.name !== null ||
               filter.name_part !== undefined && filter.name_part !== null;
    },

    /**
     * Create filter for finding all authors
     */
    all(): AuthorFilter {
        return {};
    },

    /**
     * Create filter for finding by ID
     */
    byId(id: string): AuthorFilter {
        return { author_id: id };
    },

    /**
     * Create filter for finding by exact name
     */
    byName(name: string): AuthorFilter {
        return { name: name };
    },

    /**
     * Create filter for searching by partial name
     */
    byNamePart(namePart: string): AuthorFilter {
        return { name_part: namePart };
    }
};