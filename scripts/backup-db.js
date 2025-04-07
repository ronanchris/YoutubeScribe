#!/usr/bin/env node

// Database backup script for YouTube Scribe
// This script creates a backup of the PostgreSQL database
// and saves it to the ./backups directory

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Generate filename with date stamp
const getBackupFilename = () => {
  const now = new Date();
  const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timePart = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0]; // HH-MM-SS
  return `youtube-scribe-backup-${datePart}-${timePart}.sql`;
};

// Main backup function
const backupDatabase = () => {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Parse connection details from DATABASE_URL
  let connectionDetails;
  try {
    // Parse the URL - typical format: postgres://username:password@hostname:port/database
    const url = new URL(databaseUrl);
    connectionDetails = {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.substring(1), // Remove leading slash
      user: url.username,
      password: url.password
    };
  } catch (error) {
    console.error('ERROR: Failed to parse DATABASE_URL', error.message);
    process.exit(1);
  }
  
  // Build the pg_dump command with individual params to avoid shell escaping issues
  const backupFile = path.join(backupsDir, getBackupFilename());
  
  // Build environment variables for pg_dump
  const env = {
    ...process.env,
    PGHOST: connectionDetails.host,
    PGPORT: connectionDetails.port,
    PGDATABASE: connectionDetails.database,
    PGUSER: connectionDetails.user,
    PGPASSWORD: connectionDetails.password
  };
  
  console.log(`Starting backup of database ${connectionDetails.database}...`);
  
  // Execute pg_dump without shell to avoid escaping issues
  const pg_dump = exec(
    `pg_dump --format=plain --no-owner --no-acl > "${backupFile}"`,
    { env }
  );
  
  pg_dump.stderr.on('data', (data) => {
    console.error(`pg_dump error: ${data}`);
  });
  
  pg_dump.on('close', (code) => {
    if (code === 0) {
      const stats = fs.statSync(backupFile);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`Backup completed successfully!`);
      console.log(`Saved to: ${backupFile}`);
      console.log(`Backup size: ${fileSizeInMB} MB`);
      console.log('\nTo download this file:');
      console.log('1. In Replit, go to the "Files" panel');
      console.log(`2. Navigate to the "backups" folder`);
      console.log(`3. Right-click on "${path.basename(backupFile)}" and select "Download"`);
    } else {
      console.error(`Backup failed with exit code: ${code}`);
    }
  });
};

// Run the backup function when script is executed directly
console.log('YouTube Scribe Database Backup Tool');
console.log('===================================');
backupDatabase();

// Export the function for use in other modules
export { backupDatabase };