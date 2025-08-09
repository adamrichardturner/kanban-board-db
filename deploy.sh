#!/bin/bash

set -e

echo "🚀 Starting Kanban Board Database deployment..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it from env.production.example"
    exit 1
fi

set -a  # automatically export all variables
source .env.production
set +a  # disable automatic export

echo "📦 Building and starting PostgreSQL container..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

echo "🔍 Checking database connection..."
docker exec kanban_postgres_prod pg_isready -U $POSTGRES_USER -d $POSTGRES_DB

echo "🔄 Running database migrations..."
npm run migrate:up

echo "🌱 Seeding initial data..."
npm run db:seed

echo "✅ Database deployment completed successfully!"
echo "📊 Database is running on port ${POSTGRES_PORT:-5433}"
echo "🔍 Check status with: docker compose -f docker-compose.prod.yml ps"
echo "📝 View logs with: docker compose -f docker-compose.prod.yml logs -f postgres"
