import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('authors', (table) => {
        table.integer('user_id').unsigned().nullable().after('description');
        table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('authors', (table) => {
        table.dropForeign(['user_id']);
        table.dropColumn('user_id');
    });
}
