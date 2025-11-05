#!/bin/bash

# Connect to database using psql
# Usage: ./scripts/connect-db.sh

# Load environment variables
source .env

echo "Connecting to database..."
echo "Type 'exit' or '\q' to quit"
echo ""

# Connect using psql
psql "$DATABASE_URL"
