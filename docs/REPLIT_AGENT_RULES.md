# Replit Agent Rules

This document provides guidelines for effectively working with the Replit AI assistant on the YoutubeScribe project.

## Key Documentation Files

When starting a new chat session, consider asking the AI to review these important files for context:

1. **Project Structure**: `docs/PROJECT_STRUCTURE.md`
   - Contains the file organization and directory structure overview

2. **Dependencies**: `docs/DEPENDENCIES.md`
   - Lists all project dependencies and their purposes

3. **Deployment Information**: `docs/DEPLOYMENT_NOTES.md`
   - Details about deployment requirements and configurations

4. **Database Documentation**: `docs/DATABASE_GUIDE.md`
   - Database schema, operations, and maintenance procedures

5. **User Guide**: `docs/USER_GUIDE.md`
   - Application usage instructions and features

## Suggested Prompts

### For General Context

```
Before we begin, please review the project documentation in docs/PROJECT_STRUCTURE.md and docs/DEPENDENCIES.md to understand the current project organization and technical stack.
```

### For Feature Development

```
I would like to develop a new feature for YoutubeScribe. Please review docs/PROJECT_STRUCTURE.md to understand where the relevant components should be placed, and docs/DEPENDENCIES.md to see if we need any additional packages.
```

### For Database Operations

```
I need to make changes to the database. Please review docs/DATABASE_GUIDE.md before we proceed to understand the current schema and how to maintain backward compatibility.
```

### For Deployment Assistance

```
I am preparing to deploy an update. Please review docs/DEPLOYMENT_NOTES.md to ensure we meet all the requirements for the deployment environment.
```

## Best Practices

1. **Be Specific**: Mention exactly which documentation files contain relevant information for your current task.

2. **Provide Context**: Briefly describe what you are trying to accomplish to help the AI understand the broader goal.

3. **Start Fresh**: Begin each significant new feature or bug fix with a new chat session, asking the AI to review the appropriate documentation.

4. **Maintain Documentation**: When making significant changes to the codebase, remember to ask the AI to update the relevant documentation files.

5. **Use Project Terms**: Refer to components, features, and concepts using the same terminology found in the documentation to maintain consistency.

## Important Notes

- The AI does not automatically remember information from previous sessions
- The AI needs explicit instructions to review files at the start of each new conversation
- Documentation files are the primary way to maintain continuity between different chat sessions
