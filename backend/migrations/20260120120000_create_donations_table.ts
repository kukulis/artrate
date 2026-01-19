import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('donations', (table) => {
        table.string('id', 64).primary();
        table.string('order_id', 64).notNullable().unique();
        table.string('email', 255).notNullable();
        table.string('name', 255).nullable();
        table.integer('amount').notNullable(); // cents
        table.string('currency', 3).defaultTo('EUR');
        table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).defaultTo('pending');
        table.string('paysera_payment_id', 255).nullable();
        table.text('message').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('completed_at').nullable();

        // Add indexes for common lookups
        table.index('email');
        table.index('status');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('donations');
}
