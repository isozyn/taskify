#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-db.sh

# Load environment variables
source .env

# Create backup directory if it doesn't exist
mkdir -p backups

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup filename
BACKUP_FILE="backups/taskify_backup_${TIMESTAMP}.sql"

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL=$DATABASE_URL

echo "Creating backup: $BACKUP_FILE"

# Use pg_dump to create backup
# Note: You'll need to install postgresql-client
# Ubuntu/Debian: sudo apt-get install postgresql-client
# Mac: brew install postgresql

pg_dump "$DB_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Keep only last 10 backups
    ls -t backups/*.sql | tail -n +11 | xargs -r rm
    echo "📦 Cleaned up old backups (keeping last 10)"
else
    echo "❌ Backup failed!"
    exit 1
fi
