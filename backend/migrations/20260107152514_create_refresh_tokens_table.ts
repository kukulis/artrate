import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('token', 512).notNullable().unique();
        table.timestamp('expires_at').notNullable();
        table.boolean('is_revoked').defaultTo(false).notNullable();
        table.string('user_agent', 500).nullable();
        table.string('ip_address', 45).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign key to users table
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

        // Indexes
        table.index('token');
        table.index('user_id');
        table.index(['expires_at', 'is_revoked']);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('refresh_tokens');
}

