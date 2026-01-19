import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('rankings', (table) => {
        // Drop the old unique constraint (article_id, ranking_type, user_id)
        table.dropUnique(['article_id', 'ranking_type', 'user_id']);

        // Add new unique constraint including helper_type
        table.unique(['article_id', 'ranking_type', 'user_id', 'helper_type']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('rankings', (table) => {
        // Drop the new unique constraint
        table.dropUnique(['article_id', 'ranking_type', 'user_id', 'helper_type']);

        // Restore the old unique constraint
        table.unique(['article_id', 'ranking_type', 'user_id']);
    });
}
