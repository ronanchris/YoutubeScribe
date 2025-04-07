# Deployment Considerations: YoutubeScribe

This document outlines the deployment requirements for the YoutubeScribe project.

## 1. Runtime Environment
* **Language:** Node.js
* **Version:** 20.x or higher

## 2. System Dependencies
* PostgreSQL 14.x or higher (for database storage)
* None for the application itself (all dependencies are Node.js packages)

## 3. Application Type
* **Type:** Express web server with React frontend
* **Entry Point:** `npm start` (production) or `npm run dev` (development)
* **Notes:** Requires a persistent web server

## 4. Data Storage
* **Type:** PostgreSQL
* **Details:** 
  * Connects to PostgreSQL database specified in DATABASE_URL environment variable
  * Uses Drizzle ORM for database operations
  * Stores user accounts, video summaries, and screenshot data
* **Persistence:** Data must persist between deployments
* **Database:** PostgreSQL >= 14

## 5. External Services & Networking
* **Services:** 
  * OpenAI API (for AI-powered summarization)
  * YouTube oEmbed API (for video metadata)
* **Networking:** 
  * Requires outbound HTTPS access to external APIs
  * Web server listens on port specified by PORT environment variable (default: 3000)

## 6. Secrets Management
* **Method:** Environment Variables
* **Details:** 
  * `DATABASE_URL` - PostgreSQL connection string
  * `SESSION_SECRET` - Secret for session encryption
  * `OPENAI_API_KEY` - OpenAI API key
  * `NODE_ENV` - Environment setting (production/development)

## 7. Resource Needs (Estimate)
* **CPU:** Medium (higher during summary generation)
* **RAM:** Medium (1-2GB)
* **Disk:** Moderate (primarily for database storage and logs)

## 8. Deployment Options

### Replit Deployment (Recommended)
YoutubeScribe is optimized for deployment on Replit:

1. Use the Replit deployment interface
2. Set required secrets in the Replit Secrets panel
3. The application will be available at `your-repl-name.replit.app`

### Alternative Deployment Options

#### Render
* Deploy as a Web Service
* Configure the PostgreSQL database
* Set environment variables in the Render dashboard

#### Fly.io
* Deploy using Dockerfile
* Set up a PostgreSQL database instance
* Configure secrets via fly secrets set

#### Manual VPS Deployment
For self-hosting on a Virtual Private Server:

1. Clone the repository
2. Install Node.js 20.x
3. Install and configure PostgreSQL
4. Set environment variables
5. Install dependencies with `npm install`
6. Run database migrations with `npm run db:push`
7. Start the server with `npm start`

## 9. Database Considerations

### Initialization
* The database schema is managed by Drizzle ORM
* Run `npm run db:push` to apply the schema to a new database
* The first user who registers automatically becomes an administrator

### Backup Strategy
* Use the provided scripts in `/scripts/` for database backup and restore
* Schedule regular backups for data safety
* Store backups in a secure, separate location

## 10. Monitoring and Maintenance
* Implement application monitoring (optional)
* Set up database health checks
* Monitor OpenAI API usage and costs
* Schedule regular database maintenance

## 11. Security Notes
* Ensure HTTPS is configured for production
* Protect API keys and never expose them in client-side code
* Consider implementing rate limiting for API endpoints
* Keep the application and dependencies updated regularly