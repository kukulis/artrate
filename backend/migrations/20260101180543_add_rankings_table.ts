import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('rankings', (table) => {
        table.string('id', 64).primary();
        table.string('ranking_type', 64).notNullable();
        table.string('helper_type', 64).notNullable();
        table.integer('user_id').notNullable();
        table.string('article_id', 64).notNullable();
        table.integer('value').notNullable();
        table.string('description', 255).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['article_id', 'ranking_type', 'user_id'])
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('rankings');
}

