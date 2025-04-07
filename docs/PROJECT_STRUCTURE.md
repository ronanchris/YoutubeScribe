# Project Structure Overview

This document outlines the file and directory structure of the YoutubeScribe project.

## Directory Structure

```
.
├── backups/                 # Database backup files (.sql)
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components (header, footer)
│   │   │   ├── ui/          # UI components from shadcn
│   │   │   └── ...          # Feature-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and client-side libraries
│   │   ├── pages/           # Page components for routing
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Global CSS styles
│   └── index.html           # HTML template
├── data/                    # Data storage (if using file-based storage)
├── docs/                    # Project documentation
├── migrations/              # Database migration files
│   └── meta/                # Migration metadata
├── scripts/                 # Utility scripts
│   ├── backup-db.js         # Database backup script
│   ├── restore-db.js        # Database restore script
│   └── db-tools.sh          # Shell script interface for DB operations
├── server/                  # Backend Express application
│   ├── services/            # Backend services
│   │   ├── openai.ts        # OpenAI integration
│   │   ├── screenshot.ts    # Screenshot generation
│   │   └── youtube.ts       # YouTube data extraction
│   ├── auth.ts              # Authentication logic
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data storage interface
│   └── vite.ts              # Vite server configuration
└── shared/                  # Shared code between client and server
    └── schema.ts            # Database schema and type definitions
```
