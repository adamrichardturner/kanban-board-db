# Kanban Board Database - Ubuntu Server Deployment

## Server Setup Steps

### 1. Initial Server Setup

```bash
# Clone the repository
git clone <your-repo-url> kanban-board-db
cd kanban-board-db

# Install Docker if not already installed
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Logout and login again for group changes

# Install Node.js 18+ (for migrations)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy and edit the production environment file
cp env.production.example .env.production

# Edit with your secure values
nano .env.production
```

**Important**: Change `your_secure_password_here` to a strong password!

### 3. Firewall Configuration

```bash
# Allow PostgreSQL port (restrict to specific IPs if possible)
sudo ufw allow 5432/tcp

# Allow HTTP/HTTPS for health checks
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 4. Database Deployment

```bash
# Run the deployment script
./deploy.sh
```

### 5. Nginx Configuration

```bash
# Copy nginx config
sudo cp nginx/kanban.adamrichardturner.dev /etc/nginx/sites-available/

# Enable the site
sudo ln -s /etc/nginx/sites-available/kanban.adamrichardturner.dev /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d kanban.adamrichardturner.dev
```

### 7. Verification

```bash
# Check database is running
docker ps
docker-compose -f docker-compose.prod.yml ps

# Test database connection
npm run db:status

# Check health endpoint
curl https://kanban.adamrichardturner.dev/health
```

## Database Connection Details

- **Host**: kanban.adamrichardturner.dev
- **Port**: 5432
- **Database**: kanban_board
- **User**: kanban_user
- **Password**: (from .env.production)

## Frontend Environment Variables (for Vercel)

Set these in your Vercel project settings:

```
DATABASE_URL=postgresql://kanban_user:your_password@kanban.adamrichardturner.dev:5432/kanban_board
DATABASE_SSL=require
```

## Maintenance Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Backup database
npm run db:backup

# Stop database
docker-compose -f docker-compose.prod.yml down

# Start database
docker-compose -f docker-compose.prod.yml up -d

# Update database (after code changes)
git pull
npm install
npm run migrate:up
```

## Security Notes

1. Change default passwords in `.env.production`
2. Consider restricting PostgreSQL port access to specific IPs
3. Regularly backup your database
4. Monitor logs for suspicious activity
5. Keep Docker images updated

## Troubleshooting

### Database won't start

```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

### Connection refused

- Check firewall rules: `sudo ufw status`
- Verify Docker container is running: `docker ps`
- Check PostgreSQL logs for errors

### Migration issues

```bash
# Check migration status
npm run migrate:status

# Reset and re-run migrations (DANGER: destroys data)
npm run migrate:reset
```
