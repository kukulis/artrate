# Database Migrations

This directory contains Knex.js database migrations for the ArtCorrect backend.

## Quick Start

### Running Migrations

```bash
# Inside the backend container
docker-compose exec backend npm run migrate:latest

# Or if running locally
npm run migrate:latest
```

### Creating a New Migration

```bash
# Inside the backend container
docker-compose exec backend npm run migrate:make add_column_to_users

# Or if running locally
npm run migrate:make add_column_to_users
```

This will create a new timestamped file in this directory.

### Checking Migration Status

```bash
docker-compose exec backend npm run migrate:status
```

### Rolling Back Migrations

```bash
# Rollback the last batch
docker-compose exec backend npm run migrate:rollback

# Rollback all migrations
docker-compose exec backend npm run migrate:rollback --all
```

## Migration File Structure

Each migration file exports two functions:

- `up()` - Applies the migration (e.g., creates tables, adds columns)
- `down()` - Reverts the migration (e.g., drops tables, removes columns)

Example:

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('products');
}
```

## Common Migration Operations

### Creating a Table

```typescript
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('table_name', (table) => {
    table.increments('id').primary();
    table.string('column_name', 255).notNullable();
    table.timestamps(true, true);
  });
}
```

### Adding a Column

```typescript
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('table_name', (table) => {
    table.string('new_column', 255).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('table_name', (table) => {
    table.dropColumn('new_column');
  });
}
```

### Adding an Index

```typescript
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('table_name', (table) => {
    table.index('column_name');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('table_name', (table) => {
    table.dropIndex('column_name');
  });
}
```

### Adding a Foreign Key

```typescript
export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
  });
}
```

## Best Practices

1. **Always include a down() function** - This allows rollbacks if something goes wrong
2. **Keep migrations atomic** - One migration should do one thing
3. **Test your migrations** - Test both up and down migrations before committing
4. **Never modify existing migrations** - Create a new migration to fix issues
5. **Use transactions** - Knex wraps migrations in transactions by default
6. **Backup before production migrations** - Always backup your database before running migrations in production

## Troubleshooting

### Migration Already Exists

If you see "Migration already exists", check the `knex_migrations` table in your database:

```sql
SELECT * FROM knex_migrations;
```

### Migration Failed

If a migration fails, it will be rolled back automatically. Fix the issue and run again:

```bash
docker-compose exec backend npm run migrate:latest
```

### Reset All Migrations (Development Only)

```bash
# WARNING: This will delete all data
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate:latest
docker-compose exec backend npm run seed:run
```
