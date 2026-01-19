# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArtCorrect is a full-stack TypeScript application with three main components:
- **Backend**: Express.js REST API with MySQL database
- **Frontend**: Vue.js 3 SPA with TypeScript
- **Database**: MySQL 8.0

All services run in Docker containers orchestrated by Docker Compose.

## Coding Standards

**Indentation:**
- Use **4 spaces** for indentation in all files (TypeScript, JavaScript, Vue, JSON, YAML, etc.)
- Never use tabs for indentation

**Return Statement Formatting:**
- Always leave **one empty line** before `return` statements
- This improves code readability by visually separating the return from preceding logic

Example:
```typescript
function calculateTotal(items: Item[]): number {
    const sum = items.reduce((acc, item) => acc + item.price, 0)
    const tax = sum * 0.1

    return sum + tax
}
```

**Testing Guidelines:**
- **NEVER use `wget`, `curl`, or manual HTTP requests** to test endpoints
- Instead, **always propose writing automated tests** using the project's testing framework
- Automated tests are:
  - Repeatable and consistent
  - Can be run in CI/CD pipelines
  - Serve as living documentation
  - Catch regressions automatically

**How to test endpoints:**
```bash
# DON'T do this:
curl -X POST http://localhost:3000/api/articles -H "Content-Type: application/json" -d '{"title":"test"}'

# DO this instead:
# Write a test in backend/src/controllers/ArticleController.test.ts
docker compose exec backend npm test -- ArticleController.test.ts
```

Example test structure:
```typescript
describe('ArticleController', () => {
    it('should create a new article', async () => {
        const response = await request(app)
            .post('/api/articles')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ title: 'Test Article', author_id: '1', content: 'Content' })
            .expect(201)

        expect(response.body).toHaveProperty('id')
        expect(response.body.title).toBe('Test Article')
    })
})
```

**Test Development Workflow:**

**IMPORTANT**: When writing tests, follow this incremental approach:

1. **One test file at a time**
   - Create ONE test file
   - Complete it fully (write tests, fix bugs, verify)
   - Only then move to the next test file
   - **NEVER create multiple test files simultaneously** unless explicitly agreed upon in the session

2. **Skeleton-first approach**
   - Start by creating test skeletons with `assert(true)` and TODO comments
   - This provides an overview of what will be tested
   - Then flesh out one test case at a time

Example skeleton:
```typescript
describe('UserService', () => {
    it('should create a user', () => {
        // TODO: Implement test
        expect(true).toBe(true)
    })

    it('should validate email format', () => {
        // TODO: Implement test
        expect(true).toBe(true)
    })

    it('should hash passwords', () => {
        // TODO: Implement test
        expect(true).toBe(true)
    })
})
```

3. **Test-Driven Development (TDD) approach**
   - Write test → Run test (should fail) → Fix/implement code → Verify test passes
   - Tests should **find bugs**, not just validate existing behavior
   - If tests don't find any bugs, question whether they're valuable
   - Document any bugs found and code changes made during testing

4. **Explicit communication**
   - Show each bug discovered during testing
   - Explain what code was fixed and why
   - Get explicit permission before doing bulk changes (creating multiple files, refactoring, etc.)

5. **Avoid "conformist" tests**
   - Tests that only validate existing working behavior have limited value
   - Focus on edge cases, error conditions, and integration points
   - Tests should serve as regression prevention, not just documentation

## Development Philosophy

**Simplicity First:**
- When asked to implement a feature or solve a problem, **always propose the simplest and most straightforward solution first**
- Don't over-engineer or add unnecessary abstractions
- If a solution is too simplistic and may cause issues (security risks, scalability problems, maintainability concerns), include a clear warning explaining the risks
- Example: "This is the simplest approach, but **WARNING**: it uses Math.random() which is not cryptographically secure and should not be used for security tokens"

**Repository Design:**
- Repository methods must be **as universal as possible**
- Avoid specialized methods that only work for specific use cases
- Prefer generic CRUD operations (create, read, update, delete) over specialized business logic
- Keep repositories focused on data access, not business rules
- Example: Instead of `activateUserAfterEmailConfirmation()`, use generic `update()` method that can update any user fields

## Communication Rules

**Data Format Clarity:**
- When asked to write data to a file or return data from a function, **write only what is explicitly requested**
- Do NOT add wrapper objects, metadata (timestamps, model info, etc.), or "helpful" extra fields unless explicitly asked
- If unsure about the expected format, ask for clarification before implementing
- Example: "Write the API response to a file" means write the raw response, not `{ timestamp: ..., model: ..., response: ... }`

**No Speculative Code:**
- **NEVER write code to handle "future cases" or "edge cases" without concrete test data proving they exist**
- If you anticipate a potential issue, first create a test case with example data that demonstrates the problem
- Code paths without corresponding test cases are speculative and add unnecessary complexity
- Example: Don't add markdown fence stripping logic "just in case" - first show test data that contains markdown fences

**Clarify Ambiguous Requirements:**
- When a request can be interpreted multiple ways, ask for clarification before implementing
- Especially important for: data formats, file structures, API response shapes, and output destinations
- A quick clarifying question saves time compared to implementing the wrong thing and refactoring later

**Test-First for New Code Paths:**
- Before adding code to handle a new scenario, create a test case that fails without the new code
- This ensures every code path is justified by actual test data
- If you can't provide example data for a scenario, don't write code to handle it

## Development Commands

### Running the Application

```bash
# Start all services in development mode (with hot reload)
docker compose up

# Rebuild and start (after dependency changes)
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f [backend|frontend|mysql]
```

### Backend Development

**IMPORTANT:** All npm commands must be run inside the Docker container using `docker compose exec backend <command>`.

```bash
# Install dependencies (run after package.json changes)
docker compose exec backend npm install

# Testing
docker compose exec backend npm test                    # Run all tests
docker compose exec backend npm test -- <filename>      # Run specific test file

# Linting
docker compose exec backend npm run lint                # Check for issues
docker compose exec backend npm run lint:fix            # Auto-fix issues

# Build TypeScript to JavaScript
docker compose exec backend npm run build

# Database Migrations
docker compose exec backend npm run migrate:latest      # Run all pending migrations
docker compose exec backend npm run migrate:rollback    # Rollback last batch of migrations
docker compose exec backend npm run migrate:make <name> # Create new migration file
docker compose exec backend npm run migrate:status      # Check migration status

# Database Seeds
docker compose exec backend npm run seed:run            # Run all seed files
docker compose exec backend npm run seed:make <name>    # Create new seed file
```

**Note:** Development mode (`npm run dev`), build (`npm start`), and other runtime commands run automatically inside the container via docker-compose.yml - you don't need to execute them manually.

### Frontend Development

**IMPORTANT:** All npm commands must be run inside the Docker container using `docker compose exec frontend <command>`.

```bash
# Install dependencies (run after package.json changes)
docker compose exec frontend npm install

# Type checking without emitting files
docker compose exec frontend npm run type-check

# Linting
docker compose exec frontend npm run lint

# Production build
docker compose exec frontend npm run build

# Preview production build
docker compose exec frontend npm run preview
```

**Note:** Development server (`npm run dev`) runs automatically inside the container via docker-compose.yml - you don't need to execute it manually.

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

### Composables

**Naming Convention:**
- Export functions with descriptive names from composables (e.g., `resetRecaptcha` instead of `reset`)
- Avoid relying on destructuring renaming at call sites (`{ reset: resetCaptcha }`) - it adds unnecessary code
- Prefer direct usage: `const { resetRecaptcha } = useRecaptcha(...)` over `const { reset: resetCaptcha } = ...`

**useRecaptcha Composable:**
- Located at `frontend/src/composables/useRecaptcha.ts`
- Returns `{ token, resetRecaptcha, renderRecaptcha }`
- reCAPTCHA tokens are single-use - always call `resetRecaptcha()` after failed API submissions so users can retry
- Usage:
  ```typescript
  const recaptchaContainer = ref<HTMLElement | null>(null)
  const { token, resetRecaptcha } = useRecaptcha(recaptchaContainer)
  ```
- Template requires: `<div ref="recaptchaContainer"></div>`

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
# Create migration inside backend container
docker compose exec backend npm run migrate:make create_products_table

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
docker compose exec backend npm run migrate:latest

# Rollback the last batch of migrations
docker compose exec backend npm run migrate:rollback

# Check migration status
docker compose exec backend npm run migrate:status
```

**Database Seeds:**

Seeds populate the database with initial or test data:

```bash
# Create a seed file
docker compose exec backend npm run seed:make users

# Run all seeds
docker compose exec backend npm run seed:run
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
- Ensure MySQL container is healthy: `docker compose ps`
- Check environment variables in `docker-compose.yml` match database credentials
- MySQL takes ~10-20 seconds to initialize on first run

### Frontend API requests fail
- Verify backend container is running: `docker compose ps`
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

### npm install or npm test not working
- Always run npm commands through Docker: `docker compose exec backend npm install`
- Never run npm commands directly on the host machine - dependencies must be installed inside the container
- Running `npm install` on the host can cause version conflicts and permission issues
