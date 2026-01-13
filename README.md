# ArtCorrect

Full-stack TypeScript application with Express.js backend, Vue.js frontend, and MySQL database.

## Quick Start

### Development Mode

```bash
# Start all services (MySQL, backend, frontend)
docker-compose up

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MySQL: localhost:3306

### Production Mode

```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your secure passwords

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

Production URLs:
- Frontend: http://localhost
- Backend API: http://localhost:3000

## Project Structure

```
artcorrect/
├── backend/                 # Express.js TypeScript backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   └── index.ts        # Main server file
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── package.json
├── frontend/               # Vue.js 3 TypeScript frontend
│   ├── src/
│   │   ├── views/          # Vue components/views
│   │   ├── router/         # Vue Router configuration
│   │   ├── App.vue         # Root component
│   │   └── main.ts         # Application entry point
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── package.json
├── mysql/
│   └── init/               # MySQL initialization scripts
├── docker-compose.yml      # Development environment
└── docker-compose.prod.yml # Production environment
```

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Lint code
npm run lint
npm run lint:fix

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

## Technologies

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MySQL2** - MySQL client
- **Node.js 20** - Runtime environment

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Vue Router** - Client-side routing
- **Axios** - HTTP client

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MySQL 8.0** - Relational database
- **Nginx** - Web server (production frontend)

## Database

The MySQL database initializes automatically with the schema defined in `mysql/init/01-init.sql`.

To access the database:

```bash
# Using docker exec
docker exec -it artcorrect-mysql mysql -u artcorrect -partcorrect_password artcorrect_db

# Or from host (if you have mysql client installed)
mysql -h 127.0.0.1 -P 3306 -u artcorrect -partcorrect_password artcorrect_db
```

## Watch type script errors

npx vue-tsc --noEmit --watch

npm run type-check


## email config

apt install sasl2-bin libsasl2-modules

After installation:

# 1. Create password for noreply
saslpasswd2 -c -u darbelis.eu noreply

saslpasswd2 -c -f /var/spool/postfix/etc/sasldb2 noreply

# 2. Set permissions
chown postfix:postfix /etc/sasldb2
chmod 640 /etc/sasldb2

same with /var/spool/postfix/etc/sasldb2

# 3. List users to verify
sasldblistusers2

# Add user - only need one command now
saslpasswd2 -c -u darbelis.eu newuser

# Delete user - only one command
saslpasswd2 -d newuser@darbelis.eu

# List users - check either location (both show same file)
sasldblistusers2

