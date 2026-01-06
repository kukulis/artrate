import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('articles', (table) => {
        table.string('id', 64).primary();
        table.string('title', 255).notNullable();
        table.string('author_id', 64).notNullable();
        table.integer('user_id').notNullable();
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Add index on email for faster lookups
        table.index('title');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('articles');
}

