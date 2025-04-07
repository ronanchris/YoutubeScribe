# Project Structure Overview

This document outlines the organization and structure of the YoutubeScribe project codebase.

```
.
├── backups/                  # Directory for database backup files (*.sql)
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and libraries
│   │   ├── pages/            # Page components (routed in App.tsx)
│   │   ├── App.tsx           # Main application component with routing
│   │   └── main.tsx          # Application entry point
├── data/                     # Directory for data files (if needed)
├── docs/                     # Project documentation
│   ├── _index_docs.md        # Navigation index for all documentation
│   ├── ADMIN_GUIDE.md        # Admin user guide
│   ├── DATABASE_GUIDE.md     # Database management guide
│   ├── DEPLOYMENT_NOTES.md   # Deployment instructions and requirements
│   ├── GITHUB_INTEGRATION.md # GitHub repository integration guide
│   ├── PROJECT_STRUCTURE.md  # This document
│   ├── ROLES_AND_PERMISSIONS.md # Access control documentation
│   └── USER_GUIDE.md         # Regular user guide
├── migrations/               # Database migration files (if used)
├── scripts/                  # Utility scripts
│   ├── backup-db.js          # Database backup script
│   ├── db-tools.sh           # Database management shell script interface
│   ├── git-push.sh           # GitHub push helper script
│   └── restore-db.js         # Database restore script
├── server/                   # Backend Express server
│   ├── services/             # Backend service modules
│   │   ├── openai.ts         # OpenAI integration for AI summaries
│   │   ├── screenshot.ts     # Screenshot capture and processing
│   │   └── youtube.ts        # YouTube data extraction
│   ├── auth.ts               # Authentication setup
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Data storage interface
│   └── vite.ts               # Vite integration for serving frontend
├── shared/                   # Shared code between frontend and backend
│   └── schema.ts             # Database schema and type definitions
├── .gitignore                # Git ignore configuration
├── .replit                   # Replit configuration
├── drizzle.config.ts         # Drizzle ORM configuration
├── package.json              # Node.js dependencies and scripts
├── postcss.config.js         # PostCSS configuration for CSS processing
├── README.md                 # Project overview and setup instructions
├── tailwind.config.ts        # Tailwind CSS configuration
├── theme.json                # UI theme configuration for shadcn/ui
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```

## Key Directories

### `/client`
Contains the React frontend application built with TypeScript. This is where all user interface components, pages, and client-side logic reside.

### `/server` 
Contains the Express backend server responsible for API endpoints, authentication, and communication with external services.

### `/server/services`
Specialized services for core functionalities:
- **openai.ts**: Handles communication with OpenAI's API for generating AI summaries
- **screenshot.ts**: Manages screenshot capture and processing from YouTube videos
- **youtube.ts**: Extracts data from YouTube videos including transcripts and metadata

### `/shared`
Code shared between frontend and backend, primarily the database schema and type definitions.

### `/scripts`
Utility scripts for database management and GitHub integration.

### `/docs`
Comprehensive documentation organized by function and user role.

## Key Files

### `shared/schema.ts`
Defines the database schema using Drizzle ORM and Zod validation. This is the source of truth for all database types and structures.

### `server/storage.ts`
Implements the data storage interface with database operations for users, summaries, and screenshots.

### `server/routes.ts`
Defines all API endpoints exposed by the backend server.

### `client/src/App.tsx`
Main frontend component with routing definitions for all pages.

### `drizzle.config.ts`
Configuration for Drizzle ORM, specifying database connection and schema location.

## Architecture Overview

YoutubeScribe follows a modern full-stack architecture with clear separation of concerns:

1. **Frontend (React/TypeScript)**: Handles UI rendering and user interactions
2. **Backend (Express/TypeScript)**: Provides API endpoints and business logic
3. **Database (PostgreSQL/Drizzle)**: Persistent data storage
4. **External Services**: YouTube data extraction and OpenAI for AI summaries

The application uses React Query for data fetching and synchronization, ensuring consistent state across devices and sessions.

## Development Workflow

1. Define data models in `shared/schema.ts`
2. Implement database operations in `server/storage.ts`
3. Create API endpoints in `server/routes.ts`
4. Build UI components in `client/src/components`
5. Implement pages in `client/src/pages`
6. Connect pages to API with React Query in the appropriate components