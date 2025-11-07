#!/bin/bash

# Database Restore Script
# Usage: ./scripts/restore-db.sh backups/taskify_backup_20241104_120000.sql

if [ -z "$1" ]; then
    echo "❌ Error: Please provide backup file path"
    echo "Usage: ./scripts/restore-db.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh backups/*.sql 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
source .env

DB_URL=$DATABASE_URL

echo "⚠️  WARNING: This will REPLACE all current data!"
echo "Restoring from: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "Restoring database..."

# Restore the backup
psql "$DB_URL" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
