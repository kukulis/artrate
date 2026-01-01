import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('authors', (table) => {
        table.string('id', 64).primary();
        table.string('name', 255).notNullable();
        table.text('description').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Add index on email for faster lookups
        table.index('name');
    });

}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('authors');
}

