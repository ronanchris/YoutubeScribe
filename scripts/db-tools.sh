#!/bin/bash

# Database tools for YouTube Scribe
# This script provides simple commands for database backup and restore

# Print help message
function show_help {
  echo "YouTube Scribe Database Tools"
  echo "============================"
  echo ""
  echo "Usage: ./scripts/db-tools.sh [command]"
  echo ""
  echo "Commands:"
  echo "  backup    Create a backup of the current database"
  echo "  restore   Restore database from a backup file"
  echo "  help      Show this help message"
  echo ""
}

# Run the appropriate script based on command
if [ "$1" == "backup" ]; then
  node backup-db.js
elif [ "$1" == "restore" ]; then
  node restore-db.js
elif [ "$1" == "help" ] || [ -z "$1" ]; then
  show_help
else
  echo "Unknown command: $1"
  echo ""
  show_help
  exit 1
fi
