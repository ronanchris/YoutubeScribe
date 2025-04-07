# Dependencies Overview

This document provides a comprehensive overview of all dependencies used in the YoutubeScribe project, explaining their purpose and role in the application.

## Core Dependencies

### Frontend Framework

- **react** - Core UI library for building the user interface
- **react-dom** - React renderer for web applications
- **wouter** - Lightweight routing library for navigation between pages

### Backend Framework

- **express** - Web server framework for handling HTTP requests
- **express-session** - Session management middleware for Express
- **memorystore** - Memory-based session store with expiration

### Database

- **@neondatabase/serverless** - PostgreSQL client for serverless environments
- **postgres** - PostgreSQL client for Node.js
- **drizzle-orm** - Type-safe ORM for database operations
- **drizzle-zod** - Zod schema integration for Drizzle ORM
- **drizzle-kit** - CLI tools for Drizzle ORM
- **connect-pg-simple** - PostgreSQL session store for Express

### Authentication

- **passport** - Authentication middleware for Node.js
- **passport-local** - Username/password authentication strategy for Passport

### External Services

- **openai** - OpenAI API client for AI-powered summarization
- **axios** - HTTP client for API requests
- **@sendgrid/mail** - SendGrid client for email notifications
- **canvas** - Node.js canvas API for image processing

## UI Components and Styling

### Styling Framework

- **tailwindcss** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities for Tailwind
- **postcss** - CSS transformation tool
- **autoprefixer** - Adds vendor prefixes to CSS

### UI Component Libraries

- **@radix-ui/react-*** - Primitive UI components
- **shadcn/ui** - Component library built on Radix UI
- **class-variance-authority** - Utility for creating variant components
- **clsx** - Utility for conditional class names
- **tailwind-merge** - Utility for merging Tailwind classes
- **lucide-react** - Icon library
- **react-icons** - Icon library

### UI Features

- **cmdk** - Command menu component
- **react-day-picker** - Date picker component
- **react-hook-form** - Form handling library
- **@hookform/resolvers** - Validation resolvers for react-hook-form
- **zod** - Schema validation library
- **zod-validation-error** - Human-readable Zod validation errors
- **framer-motion** - Animation library
- **vaul** - Drawer component
- **recharts** - Charting library
- **embla-carousel-react** - Carousel component

## Development Tools

### TypeScript

- **typescript** - Typed JavaScript
- **@types/*** - Type definitions for various libraries
- **tsx** - TypeScript execution environment

### Build Tools

- **vite** - Build tool and development server
- **@vitejs/plugin-react** - React plugin for Vite
- **@replit/vite-plugin-*** - Replit-specific Vite plugins
- **esbuild** - JavaScript bundler

## Utility Libraries

- **date-fns** - Date manipulation library
- **ws** - WebSocket implementation

## Dependency Purpose Explanation

### Frontend Core

- **react** and **react-dom**: The foundation of the UI, enabling component-based development
- **wouter**: Provides client-side routing with a smaller footprint than react-router

### UI Components

- **shadcn UI components**: Built on top of Radix UI, providing accessible and customizable components
- **tailwindcss**: Enables rapid UI development with utility classes instead of custom CSS
- **framer-motion**: Adds smooth animations to improve user experience

### Backend Infrastructure

- **express**: Handles HTTP requests, routing, and middleware integration
- **express-session** with **connect-pg-simple**: Manages user sessions stored in PostgreSQL
- **passport**: Handles authentication flows, particularly username/password login

### Database Layer

- **postgres** and **@neondatabase/serverless**: Provide database connectivity 
- **drizzle-orm**: Offers type-safe database operations with TypeScript integration
- **drizzle-zod**: Connects database schema to Zod validation schemas

### External Services Integration

- **openai**: Connects to OpenAI's GPT models for generating video summaries
- **canvas**: Processes and manipulates images for video screenshot capture
- **axios**: Makes HTTP requests to external APIs (YouTube, etc.)

### Form Handling and Validation

- **react-hook-form**: Manages form state and validation efficiently
- **zod**: Provides schema validation for both frontend and backend

### Development Experience

- **typescript**: Adds static typing to JavaScript for better developer experience
- **vite**: Provides fast development server and optimized production builds