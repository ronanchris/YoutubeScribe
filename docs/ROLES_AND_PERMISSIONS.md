# User Roles and Permissions Matrix

This document outlines the roles available in YoutubeScribe and the permissions associated with each role.

## Available Roles

YoutubeScribe currently has two defined roles:

| Role | Description |
|------|-------------|
| **Regular User** | Standard access to create and manage their own summaries |
| **Administrator** | Extended access to manage users and view all content |

## Permissions Matrix

The following table details the specific permissions for each role:

| Permission | Regular User | Administrator |
|------------|:------------:|:-------------:|
| **Account Management** |
| Change own password | ✓ | ✓ |
| Update profile information | ✓ | ✓ |
| **Summary Management** |
| Create new summaries | ✓ | ✓ |
| View own summaries | ✓ | ✓ |
| Edit own summaries | ✓ | ✓ |
| Delete own summaries | ✓ | ✓ |
| **Admin Functions** |
| View all users' summaries | ✗ | ✓ |
| Create user invitations | ✗ | ✓ |
| Promote users to admin | ✗ | ✓ |
| Demote users from admin | ✗ | ✓ |
| View system usage statistics | ✗ | ✓ |
| **Data Management** |
| Access to own data | ✓ | ✓ |
| Access to all users' data | ✗ | ✓ |
| Perform database backups | ✗ | ✓ |
| Restore from backups | ✗ | ✓ |

## Role Assignment

### Initial Role Assignment
- New users are assigned the **Regular User** role by default
- The first user in the system is automatically assigned the **Administrator** role
- New administrator accounts can only be created by existing administrators

### Changing Roles
- Regular users cannot change their own role
- Administrators can promote regular users to administrators
- Administrators can demote other administrators to regular users (as long as at least one administrator remains)

## Technical Implementation

Role-based access control is implemented through:

1. **Database Schema**:
   - The `users` table includes an `isAdmin` boolean field to designate administrator privileges

2. **Authentication Middleware**:
   - Server-side middleware functions validate user roles before permitting access to protected resources
   - Key middleware functions:
     - `ensureAuthenticated`: Verifies the user is logged in
     - `ensureAdmin`: Verifies the user is both logged in and has administrator privileges

3. **Frontend Protection**:
   - Protected routes use a `ProtectedRoute` component that validates user roles
   - Admin-specific UI components are conditionally rendered based on user role

## Best Practices

1. **Principle of Least Privilege**:
   - Users should only have the minimum permissions needed to perform their tasks
   - Administrator accounts should be limited to trusted personnel

2. **Routine Auditing**:
   - Administrator accounts should be regularly reviewed
   - Unusual activity on administrator accounts should be investigated

3. **Secure Invitation Process**:
   - Invitation tokens should be transmitted securely to intended recipients
   - Tokens expire after a configurable time period or after first use
