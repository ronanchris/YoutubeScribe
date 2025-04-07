# YouTube Scribe Database Tools

This document provides instructions on how to back up and restore the PostgreSQL database used by YouTube Scribe.

## Why Database Backups Are Important

Regular database backups are crucial for:

1. **Data Protection**: Safeguard against accidental data loss
2. **Version Control**: Keep track of database state at different points in time
3. **Disaster Recovery**: Quickly restore service in case of failure
4. **Environment Migration**: Move data between development and production environments

## Understanding Replit Database Persistence

In Replit:

- **Code changes** are saved in Checkpoints, but these do not include database content
- The database is a **separate service** from your code
- When you deploy your application, it only updates the code, not the database content
- Development (.repl.co) and production (.replit.app) environments have separate databases

## Backup Instructions

### Using the Command Line Tool

1. Open the Shell tab in Replit
2. Run the backup command:

```bash
./scripts/db-tools.sh backup
```

This will:
- Create a backup file in the `/backups` directory
- Name the file with the current date and time (e.g., `youtube-scribe-backup-2025-04-07-12-30-45.sql`)
- Display the location and size of the backup file

### Downloading the Backup File

To save the backup file to your local computer:

1. In Replit, navigate to the Files panel
2. Locate the `/backups` folder
3. Right-click on the desired backup file
4. Select "Download"

## Restore Instructions

⚠️ **Warning**: Restoring a database will overwrite all existing data. Make sure you have a recent backup before proceeding.

### Using the Command Line Tool

1. Open the Shell tab in Replit
2. Run the restore command:

```bash
./scripts/db-tools.sh restore
```

3. You will see a list of available backup files
4. Enter the number of the backup you want to restore or 'q' to quit
5. Confirm that you want to proceed with the restore operation

## Best Practices

1. **Regular Backups**: Create backups before and after making significant changes
2. **Download Backups**: Always download important backups to your local machine
3. **Test Restores**: Periodically test that your backup files can be successfully restored
4. **Version Control**: Include the backup date in your development notes

## Troubleshooting

If you encounter issues with the backup or restore process:

1. Ensure the DATABASE_URL environment variable is correctly set
2. Check that you have sufficient permissions for the database operations
3. Verify that the PostgreSQL tools (pg_dump, psql) are available in your environment
4. Look for error messages in the command output for specific issues