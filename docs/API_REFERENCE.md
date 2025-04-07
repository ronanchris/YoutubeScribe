# API Reference

This document provides a comprehensive reference for all available API endpoints and client-side API functions in the YoutubeScribe application.

## Client-Side API Functions

The following functions are available in `client/src/lib/api.ts` and can be used to interact with the backend API.

### Summary Management

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createSummary` | Create a new summary from a YouTube URL | `{ url: string }` | Created summary with screenshots |
| `getSummary` | Get a specific summary by ID | `summaryId: number` | Summary with screenshots |
| `getAllSummaries` | Get all summaries (admin users) | None | Array of summaries with screenshots |
| `getNonAdminSummaries` | Get summaries for current user only | None | Array of summaries for current user |
| `getSummaries` | Alias for getAllSummaries | None | Array of summaries with screenshots |
| `deleteSummary` | Delete a summary by ID | `summaryId: number` | Success status (boolean) |
| `regenerateSummary` | Regenerate a summary with a different prompt | `summaryId: number, promptType: string` | Updated summary with screenshots |
| `fetchTranscriptForSummary` | Fetch transcript for a summary | `summaryId: number` | Updated summary with transcript |
| `addCustomScreenshot` | Add a custom screenshot to a summary | `summaryId: number, timestamp: number, description?: string, svgContent?: string` | Created screenshot |

### User Management

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createInvitation` | Create invitation for new user (admin only) | `{ username: string }` | Created invitation with token |
| `createUser` | Create a new user from invitation | `{ token: string, password: string }` | Success status |
| `deleteUser` | Delete a user by ID (admin only) | `userId: number` | Success status (boolean) |
| `getUsers` | Get all users (admin only) | None | Array of users |
| `promoteToAdmin` | Promote user to admin role (admin only) | `userId: number` | Updated user |
| `demoteFromAdmin` | Demote user from admin role (admin only) | `userId: number` | Updated user |
| `regenerateInvitationLink` | Regenerate invitation for user (admin only) | `userId: number` | Updated invitation with token |
| `validateInvitationToken` | Validate an invitation token | `token: string` | Validation status and username |
| `acceptInvitation` | Accept invitation and set password | `token: string, password: string` | Created user details |

### Common Request Helper

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `apiRequest` | Make an API request to the backend | `url: string, options?: RequestInit` | Response object |

## Backend API Endpoints

The following endpoints are available in the backend server (`server/routes.ts`):

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/login` | POST | Log in a user | `{ username, password }` | User object with session |
| `/api/logout` | POST | Log out the current user | None | Success message |
| `/api/user` | GET | Get the current authenticated user | None | User object or 401 |
| `/api/register` | POST | Register a new user | `{ token, password }` | Created user |
| `/api/validate-invitation` | GET | Validate invitation token | Query param: `token` | Validation status and username |
| `/api/accept-invitation` | POST | Accept invitation | `{ token, newPassword }` | Success message |

### Summary Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/summaries` | GET | Get all summaries (admin) or user's summaries | None | Array of summaries |
| `/api/summaries` | POST | Create a new summary | `{ youtubeUrl }` | Created summary |
| `/api/summaries/:id` | GET | Get a summary by ID | None | Summary with screenshots |
| `/api/summaries/:id` | DELETE | Delete a summary | None | Success message |
| `/api/summaries/:id/regenerate` | POST | Regenerate a summary | `{ promptType }` | Updated summary |
| `/api/summaries/:id/fetch-transcript` | POST | Fetch transcript for a summary | None | Updated summary |
| `/api/summaries/:id/screenshots` | POST | Add screenshot to summary | `{ timestamp, description, svgContent? }` | Created screenshot |
| `/api/user/summaries` | GET | Get current user's summaries | None | Array of summaries |

### Admin Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/admin/users` | GET | Get all users (admin only) | None | Array of users |
| `/api/admin/users/:id` | DELETE | Delete a user (admin only) | None | Success message |
| `/api/admin/users/:id/promote` | POST | Promote user to admin (admin only) | None | Updated user |
| `/api/admin/users/:id/demote` | POST | Demote user from admin (admin only) | None | Updated user |
| `/api/admin/users/:id/regenerate-invitation` | POST | Regenerate invitation (admin only) | None | New invitation |
| `/api/admin/invitations` | POST | Create invitation (admin only) | `{ username }` | Created invitation |

### Miscellaneous Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/extract-terms` | POST | Extract key terms from text | `{ text }` | Array of terms |

## Error Handling

All API functions include proper error handling with consistent error messages and HTTP status codes. Common error responses include:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Authentication and Security

The API uses session-based authentication with Express Session. Protected routes require authentication and some endpoints require admin privileges. The authentication middleware is implemented in `server/auth.ts`.
