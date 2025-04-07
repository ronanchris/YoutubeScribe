# Deployment Considerations: YoutubeScribe

This document outlines the deployment requirements for the YoutubeScribe project.

## 1. Runtime Environment
* **Language:** Node.js
* **Version:** >=18.0.0 (Recommended: 20.x)
* **Package Manager:** npm

## 2. System Dependencies
* **PostgreSQL:** Required for database storage
* **Node.js build tools:** Required for native dependencies

## 3. Application Type
* **Type:** Full-stack web application (React + Express)
* **Entry Point:** Workflow: "Start application" which runs `npm run dev`
* **Notes:** Requires a persistent web server

## 4. Data Storage
* **Type:** PostgreSQL database
* **Details:** 
  * Stores users, summaries, and screenshots
  * Uses Drizzle ORM for database operations
  * Schema defined in `shared/schema.ts`
* **Persistence:** Database content must persist between deployments
* **Database:** PostgreSQL >= 14

## 5. External Services & Networking
* **Services:** 
  * OpenAI API: For AI-powered summarization
  * YouTube data (public APIs): For video metadata and transcripts
* **Networking:** 
  * Requires outbound HTTPS access
  * Inbound access on the application port (default: 5000)

## 6. Secrets Management
* **Method:** Environment Variables
* **Details:** The following environment variables are required:
  * `DATABASE_URL` - PostgreSQL connection string
  * `OPENAI_API_KEY` - API key for OpenAI services
  * `SESSION_SECRET` - Secret for session encryption

## 7. Resource Needs (Estimate)
* **CPU:** Medium (Higher during summarization operations)
* **RAM:** Medium (1-2GB)
* **Disk:** Low (mostly for code and logs, database size depends on usage)

## 8. Build Process
* **Development:**
  * Use Replit workflow: "Start application"
* **Production:**
  ```bash
  npm install
  npm run build
  npm start
  ```

## 9. Database Migration
* Database schema is managed through Drizzle ORM
* Migrations should be applied before deployment:
  ```bash
  npm run db:push
  ```

## 10. Backup Considerations
* Regular database backups are essential
* Use the provided backup tools:
  ```bash
  ./scripts/db-tools.sh backup
  ```
* Store backups securely outside the deployment environment

## 11. Monitoring
* Application logs to stdout/stderr
* Database monitoring should be configured separately
* Consider implementing application performance monitoring

## 12. Security Considerations
* Ensure PostgreSQL is properly secured
* Use HTTPS for all traffic
* Keep dependencies updated regularly
* Review authentication implementation periodically
## 4. Data Storage
* **Type:** PostgreSQL database
* **Details:** 
  * Stores users, summaries, and screenshots
  * Uses Drizzle ORM for database operations
  * Schema defined in `shared/schema.ts`
* **Persistence:** Database content must persist between deployments
* **Database:** PostgreSQL >= 14

## 5. External Services & Networking
* **Services:** 
  * OpenAI API: For AI-powered summarization
  * YouTube data (public APIs): For video metadata and transcripts
* **Networking:** 
  * Requires outbound HTTPS access
  * Inbound access on the application port (default: 5000)

## 6. Secrets Management
* **Method:** Environment Variables
* **Details:** The following environment variables are required:
  * `DATABASE_URL` - PostgreSQL connection string
  * `OPENAI_API_KEY` - API key for OpenAI services
  * `SESSION_SECRET` - Secret for session encryption
