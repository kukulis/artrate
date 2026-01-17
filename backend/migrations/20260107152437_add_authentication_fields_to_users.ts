import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.table('users', (table) => {
        // Password authentication
        table.string('password_hash', 255).nullable();

        // User status and role
        table.boolean('is_active').defaultTo(true).notNullable();
        table.enum('role', ['user', 'admin', 'super_admin']).defaultTo('user').notNullable();

        // Password reset flow
        table.string('confirm_token', 255).nullable();
        table.string('password_reset_token', 255).nullable();
        table.timestamp('password_reset_expires').nullable();

        // Audit fields
        table.timestamp('last_login_at').nullable();

        // Add indexes for performance
        table.index('is_active');
        table.index('password_reset_token');
        table.index('confirm_token');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.table('users', (table) => {
        table.dropColumn('password_hash');
        table.dropColumn('is_active');
        table.dropColumn('role');
        table.dropColumn('password_reset_token');
        table.dropColumn('password_reset_expires');
        table.dropColumn('last_login_at');
    });
}

