# Deployment Considerations: YoutubeScribe

This document outlines the deployment requirements for the YoutubeScribe project.

## 1. Runtime Environment
* **Language:** Node.js
* **Version:** >=20.0.0 (Current LTS recommended)

## 2. System Dependencies
* **PostgreSQL:** Required for database functionality
* **pg_dump/psql:** Required for database backup and restore functionality
* **Canvas dependencies:** Required for image processing features
  * libcairo2-dev
  * libjpeg-dev
  * libpango1.0-dev
  * libgif-dev
  * build-essential

## 3. Application Type
* **Type:** Full-stack web application (Express backend + React frontend)
* **Entry Point:** `npm run dev` (development) or `npm run start` (production)
* **Notes:** Persistent web server needed; the app serves both API endpoints and static frontend assets

## 4. Data Storage
* **Type:** PostgreSQL
* **Details:** 
  * Stores user accounts, video summaries, and screenshot metadata
  * Uses Drizzle ORM for database operations
  * Configuration via DATABASE_URL environment variable
* **Persistence:** Database data must persist between deployments
* **Database:** PostgreSQL >= 14 recommended

## 5. External Services & Networking
* **Services:**
  * YouTube Data API (for video metadata)
  * OpenAI API (for AI-powered summarization)
  * GitHub API (for repository integration, optional)
* **Networking:** 
  * Requires outbound HTTPS access to external APIs
  * Default port: 3000 (configurable via PORT environment variable)

## 6. Secrets Management
* **Method:** Environment Variables
* **Required Secrets:**
  * `DATABASE_URL` - PostgreSQL connection string
  * `OPENAI_API_KEY` - OpenAI API key for GPT-4o
  * `SESSION_SECRET` - Secret for Express session encryption
  * `GITHUB_TOKEN` - GitHub personal access token (only if using GitHub integration)

## 7. Resource Needs (Estimate)
* **CPU:** Medium (Higher during OpenAI API calls and image processing)
* **RAM:** Medium (1-2GB)
* **Disk:** 
  * Moderate for application (< 500MB)
  * Database size depends on usage (grows with summaries and screenshots)
  * Backup storage scales with database size

## 8. Deployment Options

### Replit Deployment (Recommended)
The application is optimized for deployment on Replit:
1. Use the built-in Deploy button in the Replit interface
2. Set required environment secrets in the Replit Secrets panel
3. Ensure the PostgreSQL database is properly configured

### Traditional Hosting
For deployment outside of Replit:
1. Clone the repository
2. Install Node.js (>= 20.0.0) and PostgreSQL
3. Install dependencies: `npm install`
4. Set up environment variables
5. Run database migrations: `npm run db:push`
6. Build frontend: `npm run build`
7. Start server: `npm run start`

## 9. Backup Considerations
* Regular database backups recommended
* Use the included backup scripts:
  * `./scripts/db-tools.sh backup` - Creates a timestamped backup
  * `./scripts/db-tools.sh restore` - Restores from a backup file
* Store backups securely outside of the application directory

## 10. Monitoring & Maintenance
* Application logs to stdout/stderr
* Consider implementing a monitoring solution for production
* Regular backup verification recommended
* Update dependencies periodically for security patches

## 11. Cross-Device Synchronization
The application uses TanStack Query (React Query) with optimized settings to maintain data consistency across devices. The following features ensure proper synchronization:
* Automatic refetching when users regain window focus
* Optimized stale time settings for different data types
* Cache invalidation after mutations

## Related Documentation
* [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Detailed database management guide
* [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) - GitHub repository integration guide