#!/usr/bin/env node

// Database restore script for YouTube Scribe
// This script restores a PostgreSQL database from a backup file

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupsDir = path.join(__dirname, '..', 'backups');

// Function to list available backups
const listBackups = () => {
  if (!fs.existsSync(backupsDir)) {
    console.log('No backups directory found.');
    return [];
  }
  
  const files = fs.readdirSync(backupsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .reverse(); // Most recent first
  
  if (files.length === 0) {
    console.log('No backup files found in the backups directory.');
    return [];
  }
  
  console.log('Available backup files:');
  files.forEach((file, index) => {
    const stats = fs.statSync(path.join(backupsDir, file));
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`${index + 1}. ${file} (${fileSizeInMB} MB)`);
  });
  
  return files;
};

// Function to restore from a backup file
const restoreDatabase = (backupFile) => {
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
  
  // Build environment variables for psql
  const env = {
    ...process.env,
    PGHOST: connectionDetails.host,
    PGPORT: connectionDetails.port,
    PGDATABASE: connectionDetails.database,
    PGUSER: connectionDetails.user,
    PGPASSWORD: connectionDetails.password
  };
  
  console.log(`Restoring database ${connectionDetails.database} from backup...`);
  console.log('WARNING: This will overwrite existing data. Make sure you have a backup!');
  console.log(`Backup file: ${backupFile}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('Restore cancelled.');
      return;
    }
    
    // Execute psql to restore from the backup file
    const psql = exec(
      `psql --echo-errors < "${backupFile}"`,
      { env }
    );
    
    psql.stdout.on('data', (data) => {
      console.log(data);
    });
    
    psql.stderr.on('data', (data) => {
      console.error(`psql error: ${data}`);
    });
    
    psql.on('close', (code) => {
      if (code === 0) {
        console.log('Restore completed successfully!');
      } else {
        console.error(`Restore failed with exit code: ${code}`);
      }
    });
  });
};

// Interactive mode to select a backup file
const interactiveRestore = () => {
  const files = listBackups();
  
  if (files.length === 0) {
    process.exit(1);
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter the number of the backup to restore or "q" to quit: ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'q') {
      process.exit(0);
    }
    
    const index = parseInt(answer, 10) - 1;
    if (isNaN(index) || index < 0 || index >= files.length) {
      console.error('Invalid selection. Please run the script again and select a valid backup.');
      process.exit(1);
    }
    
    const backupFile = path.join(backupsDir, files[index]);
    restoreDatabase(backupFile);
  });
};

// Run in interactive mode when script is executed directly
console.log('YouTube Scribe Database Restore Tool');
console.log('====================================');
interactiveRestore();

// Export functions for use in other modules
export { restoreDatabase, listBackups, interactiveRestore };