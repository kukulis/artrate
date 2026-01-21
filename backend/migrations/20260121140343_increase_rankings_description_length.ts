import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('rankings', (table) => {
        table.string('description', 1024).nullable().alter();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('rankings', (table) => {
        table.string('description', 255).nullable().alter();
    });
}

