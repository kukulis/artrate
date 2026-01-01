import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('rankings', (table) => {
        table.string('id', 64).primary();
        table.string('ranking_type', 64).notNullable();
        table.string('user_id', 64).notNullable();
        table.integer('value').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['ranking_type', 'user_id'])
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('rankings');
}

