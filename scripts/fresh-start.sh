#!/bin/bash

# Fresh database startup script
set -e

echo "🧹 Fresh start: Removing all existing containers and volumes..."

# Source environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

export $(cat .env.production | xargs)

# Stop and remove all containers and volumes
docker compose -f docker-compose.prod.yml down -v --remove-orphans

# Remove any orphaned volumes
docker volume prune -f

# Pull latest images
docker compose -f docker-compose.prod.yml pull

echo "🚀 Starting fresh database..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 20

# Check database connection
echo "🔍 Checking database connection..."
docker exec kanban_postgres_prod pg_isready -U $POSTGRES_USER -d $POSTGRES_DB

echo "🔄 Running database migrations..."
npm run migrate:up

echo "🌱 Seeding initial data..."
npm run db:seed

echo "✅ Fresh database startup completed successfully!"
echo "📊 Database is running on port ${POSTGRES_PORT:-5433}"
