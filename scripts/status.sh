#!/bin/bash

# Check database status script
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

set -a  # automatically export all variables
source .env.production
set +a  # disable automatic export

echo "🔍 Database Status Check"
echo "======================="
echo "📊 Port: ${POSTGRES_PORT:-5433}"
echo "🗄️  Database: ${POSTGRES_DB}"
echo "👤 User: ${POSTGRES_USER}"
echo ""

echo "📦 Docker Container Status:"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

echo ""
echo "🔍 Database Connection Test:"
if docker exec kanban_postgres_prod pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; then
    echo "✅ Database is ready and accepting connections"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "📊 Container Resources:"
docker stats --no-stream kanban_postgres_prod
