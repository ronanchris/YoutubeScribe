# YoutubeScribe

A private web application that leverages AI to extract, summarize, and organize multimedia content transcripts with intelligent processing and collaborative management tools.

## Features

- **AI-Powered Video Analysis**: Generate comprehensive summaries of YouTube videos
- **Key Point Extraction**: Automatically identify and list important information
- **Visual Element Detection**: Capture and analyze screenshots from videos
- **User Management System**: Role-based access with admin capabilities
- **Secure Invitation System**: Add new users through secure invitation links

## Documentation

For detailed information about using YoutubeScribe, please refer to the following documentation:

- [User Guide](docs/USER_GUIDE.md) - Comprehensive guide to all features and functionality
- [Project Log](PROJECT_LOG.md) - Development history and technical notes

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **AI**: OpenAI GPT-4o integration for content processing

## Getting Started

1. Ensure you have Node.js and PostgreSQL installed
2. Clone this repository
3. Install dependencies with `npm install`
4. Configure environment variables (see `.env.example`)
5. Start the application with `npm run dev`
6. Access the application at `http://localhost:3000`

## Keeping Documentation Updated

The project documentation should be kept up-to-date as features are added or modified. When making changes to the codebase, please ensure that the [User Guide](docs/USER_GUIDE.md) is updated to reflect these changes.

Key areas to keep current:
- Feature descriptions and usage instructions
- User role permissions
- Administrative functions
- Troubleshooting information