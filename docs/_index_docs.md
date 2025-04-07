# YoutubeScribe Documentation Index

This index provides a comprehensive guide to all documentation files for the YoutubeScribe project, organized by topic and relevance.

## Getting Started

- [**USER_GUIDE.md**](./USER_GUIDE.md) - Essential guide for end users who want to use the YoutubeScribe application
- [**ADMIN_GUIDE.md**](./ADMIN_GUIDE.md) - Administrative guide for managing users, invitations, and system settings

## System Architecture & Technical Documentation

- [**PROJECT_STRUCTURE.md**](./PROJECT_STRUCTURE.md) - Overview of the project's file and directory organization
- [**DEPENDENCIES.md**](./DEPENDENCIES.md) - Detailed list of project dependencies and their purposes

## Database & Data Management

- [**DATABASE_GUIDE.md**](./DATABASE_GUIDE.md) - Complete guide to database setup, maintenance, and backup procedures

## Security & Access Control

- [**ROLES_AND_PERMISSIONS.md**](./ROLES_AND_PERMISSIONS.md) - Documentation of user roles and permission systems

## Deployment & Operations

- [**DEPLOYMENT_NOTES.md**](./DEPLOYMENT_NOTES.md) - Comprehensive guide for deploying the application to various environments
- [**HOSTING_OPTIONS.md**](./HOSTING_OPTIONS.md) - Detailed comparison of hosting environments with recommendations
- [**GITHUB_INTEGRATION.md**](./GITHUB_INTEGRATION.md) - Guide for working with the GitHub repository

## Development Guidelines

- [**REPLIT_AGENT_RULES.md**](./REPLIT_AGENT_RULES.md) - Rules and guidelines for Replit AI agents working on this project
- [**FIGMA_IMPLEMENTATION.md**](./FIGMA_IMPLEMENTATION.md) - Guide for implementing Figma designs into React components

## Document Relationships

```
                   ┌───────────────────┐
                   │   _index_docs.md  │
                   │  (You are here)   │
                   └─────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌────────▼────────┐    ┌──────▼───────┐
│  User Docs   │    │ Technical Docs  │    │ Admin Docs   │
└───────┬──────┘    └────────┬────────┘    └──────┬───────┘
        │                    │                    │
┌───────▼──────┐    ┌────────▼────────┐    ┌──────▼───────┐
│ USER_GUIDE.md│    │PROJECT_STRUCTURE│    │ ADMIN_GUIDE  │
└──────────────┘    │DEPENDENCIES.md  │    └──────────────┘
                    │DATABASE_GUIDE.md│
                    └────────┬────────┘
                             │
                   ┌─────────▼─────────┐
                   │ Operational Docs  │
                   └─────────┬─────────┘
                             │
  ┌─────────────────┬───────┴───────┬────────────────┐
  │                 │               │                 │
┌─▼────────────────┐│┌─────────────▼┐ ┌──────────────▼┐
│DEPLOYMENT_NOTES.md││HOSTING_OPTIONS│ │GITHUB_INTEGRAT│
└──────────────────┘│└──────────────┘ └───────────────┘
                    │                                  
                    │┌────────────────┐                
                    ││                │                
                    ▼│                │                
                    ┌▼────────────────┐                
                    │REPLIT_AGENT_RULE│                
                    └─────────────────┘                
```

## Quick Reference Guide

| If You Need To... | Refer To |
|-------------------|----------|
| Use the application as a regular user | [USER_GUIDE.md](./USER_GUIDE.md) |
| Manage users or system settings | [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) |
| Understand the codebase structure | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |
| Handle database maintenance or backups | [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) |
| Deploy the application | [DEPLOYMENT_NOTES.md](./DEPLOYMENT_NOTES.md) |
| Compare hosting options | [HOSTING_OPTIONS.md](./HOSTING_OPTIONS.md) |
| Work with the GitHub repository | [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) |
| Understand user permissions | [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) |
| Check project dependencies | [DEPENDENCIES.md](./DEPENDENCIES.md) |
| Develop with Replit AI | [REPLIT_AGENT_RULES.md](./REPLIT_AGENT_RULES.md) |
| Implement Figma designs | [FIGMA_IMPLEMENTATION.md](./FIGMA_IMPLEMENTATION.md) |
