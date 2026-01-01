import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      email: 'user@example.com',
      name: 'Sample User',
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  ]);
}
