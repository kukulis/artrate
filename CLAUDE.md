# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArtCorrect is a full-stack TypeScript application with three main components:
- **Backend**: Express.js REST API with MySQL database
- **Frontend**: Vue.js 3 SPA with TypeScript
- **Database**: MySQL 8.0

All services run in Docker containers orchestrated by Docker Compose.

## Development Commands

### Running the Application

```bash
# Start all services in development mode (with hot reload)
docker-compose up

# Rebuild and start (after dependency changes)
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [backend|frontend|mysql]
```

### Backend Development

```bash
cd backend

# Install dependencies (run after package.json changes)
npm install

# Development mode with hot reload (inside container)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Linting
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues

# Testing
npm test

# Database Migrations (inside container or local)
npm run migrate:latest    # Run all pending migrations
npm run migrate:rollback  # Rollback last batch of migrations
npm run migrate:make <name>  # Create new migration file
npm run migrate:status    # Check migration status

# Database Seeds (inside container or local)
npm run seed:run      # Run all seed files
npm run seed:make <name>  # Create new seed file
```

### Frontend Development

```bash
cd frontend

# Install dependencies (run after package.json changes)
npm install

# Development server with hot reload (inside container)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type checking without emitting files
npm run type-check

# Linting
npm run lint
```

## Architecture

### Backend Architecture

The Express.js backend follows a simple structure:

- `src/index.ts` - Main server entry point, middleware setup, route definitions
- `src/config/database.ts` - MySQL connection utilities (single connection and connection pool)
- Environment variables loaded via `dotenv` from `.env` file

**Database Connection Pattern**:
- Use `connectDatabase()` for one-off queries (creates/closes connection)
- Use `createConnectionPool()` for high-traffic endpoints (maintains connection pool)

**API Communication**:
- Backend exposes REST endpoints on port 3000
- Frontend proxies `/api/*` requests to backend (configured in `vite.config.ts` for dev, `nginx.conf` for prod)

### Frontend Architecture

Vue.js 3 application using Composition API with TypeScript:

- `src/main.ts` - Application entry point, router setup
- `src/App.vue` - Root component with layout structure
- `src/router/index.ts` - Vue Router configuration
- `src/views/` - Page-level components (routed)

**Key Patterns**:
- All components use `<script setup lang="ts">` syntax (Composition API)
- TypeScript interfaces define API response types
- Axios handles HTTP requests to backend
- Vite dev server proxies API requests to avoid CORS issues

### Docker Architecture

**Development Setup** (`docker-compose.yml`):
- Uses `Dockerfile.dev` for both frontend and backend
- Mounts source code as volumes for hot reload
- Node modules stored in named volumes to avoid host/container conflicts
- Backend waits for MySQL health check before starting

**Production Setup** (`docker-compose.prod.yml`):
- Uses production `Dockerfile` for optimized builds
- Backend compiled to JavaScript
- Frontend built and served via Nginx
- No volume mounts (immutable containers)

**Network**:
- All containers on `artcorrect-network` bridge network
- Services communicate using container names as hostnames (e.g., `http://backend:3000`)

## Adding New Features

### Adding a Backend Endpoint

1. Define route in `backend/src/index.ts`
2. Add database queries using connection from `src/config/database.ts`
3. Use TypeScript types for request/response

Example:
```typescript
app.get('/api/users', async (_req: Request, res: Response) => {
  const connection = await connectDatabase();
  const [rows] = await connection.query('SELECT * FROM users');
  await connection.end();
  res.json(rows);
});
```

### Adding a Frontend View

1. Create component in `frontend/src/views/YourView.vue`
2. Add route in `frontend/src/router/index.ts`
3. Use TypeScript interfaces for API data
4. Make API calls with Axios

Example:
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])

onMounted(async () => {
  const response = await axios.get<User[]>('/api/users')
  users.value = response.data
})
</script>
```

### Database Migrations

This project uses **Knex.js** for database migrations. Migrations are versioned TypeScript files that define schema changes.

**Creating a Migration:**
```bash
# Inside backend container or locally
docker-compose exec backend npm run migrate:make create_products_table

# This creates: backend/migrations/TIMESTAMP_create_products_table.ts
```

**Migration File Structure:**
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('products');
}
```

**Running Migrations:**
```bash
# Apply all pending migrations
docker-compose exec backend npm run migrate:latest

# Rollback the last batch of migrations
docker-compose exec backend npm run migrate:rollback

# Check migration status
docker-compose exec backend npm run migrate:status
```

**Database Seeds:**

Seeds populate the database with initial or test data:

```bash
# Create a seed file
docker-compose exec backend npm run seed:make users

# Run all seeds
docker-compose exec backend npm run seed:run
```

**Migration Best Practices:**
- Always create both `up()` and `down()` functions for rollback support
- Use TypeScript for type safety
- Keep migrations small and focused on single changes
- Test rollbacks to ensure they work correctly
- Run migrations as part of deployment process

**Note:** The `mysql/init/*.sql` files are only used for initial database setup when the MySQL container is first created. For all subsequent schema changes, use Knex migrations.

## Common Issues

### Backend can't connect to MySQL
- Ensure MySQL container is healthy: `docker-compose ps`
- Check environment variables in `docker-compose.yml` match database credentials
- MySQL takes ~10-20 seconds to initialize on first run

### Frontend API requests fail
- Verify backend container is running: `docker-compose ps`
- Check Vite proxy configuration in `frontend/vite.config.ts` (dev)
- Check Nginx proxy configuration in `frontend/nginx.conf` (prod)
- Ensure backend is accessible at `http://backend:3000` from within Docker network

### Hot reload not working
- Confirm volumes are mounted correctly in `docker-compose.yml`
- For backend: Check nodemon is watching `src/` directory
- For frontend: Vite server must bind to `0.0.0.0` (not `localhost`)

### Port conflicts
- Default ports: 3306 (MySQL), 3000 (backend), 5173 (frontend dev), 80 (frontend prod)
- Change port mappings in `docker-compose.yml` if conflicts occur
