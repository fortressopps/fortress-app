# Fortress v7.24 - Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- Node.js 18+ (for local development)

## Quick Start (Docker)

### 1. Clone and Configure
```bash
git clone <repository-url>
cd fortress-app
cp .env.production.example .env.production
```

### 2. Generate Secrets
```bash
# Generate JWT secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # REFRESH_TOKEN_SECRET
openssl rand -base64 32  # SESSION_SECRET
```

Edit `.env.production` with generated secrets and database passwords.

### 3. Build and Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Run Migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Verify Health
```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/ready
```

## Production Deployment

### Environment Variables
Required variables (see `.env.production.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `SESSION_SECRET`: Auth secrets
- `APP_ENV=production`

### Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed data
npx prisma db seed
```

### Monitoring Endpoints
- `GET /health` - Basic health check (200 = OK)
- `GET /health/ready` - Readiness probe (checks DB connection)
- `GET /health/live` - Liveness probe (uptime + memory)

### Scaling
```bash
# Scale app instances
docker-compose up -d --scale app=3
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec app npx prisma db pull
```

### Redis Connection Issues
```bash
# Check Redis logs
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
```

### Application Logs
```bash
# View real-time logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

## Backup & Recovery

### Database Backup
```bash
docker-compose exec postgres pg_dump -U fortress_app fortress > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U fortress_app fortress < backup.sql
```

## Security Checklist
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Enable HTTPS (use reverse proxy like Nginx/Caddy)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

## Support
For issues, consult:
- `FORTRESS_DOCS_V7/runbooks/` - Operational runbooks
- `docs/ARCHITECTURE_ANALYSIS_*.md` - Architecture documentation
- `FORTRESS_DOCS_V7/ops/ops_manual_v_7.md` - Operations manual
