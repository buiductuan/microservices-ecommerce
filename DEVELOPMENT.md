# Development Guide

This guide explains how to set up and run the NestJS microservices project in development mode with hot reload functionality.

## Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)
- npm or yarn

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-microservices
   ```

2. **Start development environment**
   ```bash
   ./dev.sh up
   ```

   This will start all services with hot reload enabled.

## Development Script

The `dev.sh` script provides convenient commands for development:

```bash
# Start all services
./dev.sh up

# Stop all services
./dev.sh down

# Restart all services
./dev.sh restart

# View logs for all services
./dev.sh logs

# View logs for a specific service
./dev.sh logs api-gateway

# Build Docker images
./dev.sh build

# Rebuild images from scratch (when dependencies change)
./dev.sh rebuild

# Show service status
./dev.sh status

# Open shell in a running service
./dev.sh shell api-gateway

# Clean up Docker resources
./dev.sh clean

# Install new dependencies
./dev.sh install
```

## Services and Ports

When running in development mode, services are available at:

- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Product Service**: http://localhost:3002
- **Order Service**: http://localhost:3003
- **Notification Service**: http://localhost:3004
- **Frontend**: http://localhost:3600
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

## Hot Reload Configuration

### Backend Services (NestJS)

Each microservice is configured with:
- **Nodemon** for file watching and automatic restarts
- **Volume mounts** for real-time code synchronization
- **TypeScript compilation** on-the-fly
- **Shared libraries** watching (`libs/` directory)

File changes in the following directories will trigger a restart:
- `apps/[service-name]/src/`
- `libs/`

### Frontend (React + Vite)

The frontend service uses:
- **Vite dev server** with hot module replacement (HMR)
- **Volume mounts** for real-time code synchronization
- **Fast refresh** for React components

### Configuration Files

- **nodemon.json**: Global nodemon configuration
- **Dockerfile.*.dev**: Development Docker configurations
- **docker-compose.dev.yml**: Development services orchestration

## Adding New Dependencies

When adding new dependencies:

1. **For backend services**: Add to root `package.json`
2. **For frontend**: Add to `apps/frontend/package.json`
3. **Rebuild images**: Run `./dev.sh rebuild`

## Development Workflow

1. **Start the environment**
   ```bash
   ./dev.sh up
   ```

2. **Make code changes**
   - Backend: Edit files in `apps/[service]/src/` or `libs/`
   - Frontend: Edit files in `apps/frontend/src/`

3. **Services automatically reload**
   - Watch the logs: `./dev.sh logs [service-name]`

4. **Test your changes**
   - Backend: API endpoints available immediately
   - Frontend: Browser auto-refreshes

## Debugging

### View Service Logs
```bash
# All services
./dev.sh logs

# Specific service
./dev.sh logs api-gateway
```

### Access Service Shell
```bash
./dev.sh shell api-gateway
```

### Check Service Status
```bash
./dev.sh status
```

## Troubleshooting

### Services Won't Start
1. Check Docker is running: `docker info`
2. Check ports are available: `netstat -tulpn | grep :[port]`
3. Rebuild images: `./dev.sh rebuild`

### Hot Reload Not Working
1. Check volume mounts in `docker-compose.dev.yml`
2. Verify file changes are reflected in container: `./dev.sh shell [service]`
3. Check nodemon logs: `./dev.sh logs [service]`

### Database Connection Issues
1. Wait for PostgreSQL to be ready (health check)
2. Check environment variables in `docker-compose.dev.yml`
3. Verify database initialization: `./dev.sh logs postgres`

## Performance Tips

1. **Use .dockerignore**: Excludes unnecessary files from Docker context
2. **Multi-stage builds**: Optimized for development vs production
3. **Volume caching**: Anonymous volumes for `node_modules`
4. **Dependency caching**: Layer-based Docker caching

## Environment Variables

Development environment variables are set in `docker-compose.dev.yml`. Key variables:

- `NODE_ENV=development`
- Database connection settings
- Service discovery (host/port configurations)
- JWT secrets
- External service credentials

## File Structure

```
├── apps/                          # Microservices applications
│   ├── api-gateway/              # API Gateway service
│   ├── user-service/             # User management service
│   ├── product-service/          # Product catalog service
│   ├── order-service/            # Order processing service
│   ├── notification-service/     # Notification service
│   └── frontend/                 # React frontend
├── libs/                         # Shared libraries
├── infrastructure/
│   └── docker/                   # Development Dockerfiles
├── docker-compose.dev.yml        # Development orchestration
├── nodemon.json                  # Nodemon configuration
├── dev.sh                        # Development helper script
└── .dockerignore                 # Docker build context exclusions
```
