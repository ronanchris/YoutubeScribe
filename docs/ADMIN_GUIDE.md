# YoutubeScribe Administrator Guide

This guide is specifically for users with administrator privileges in YoutubeScribe. For regular user documentation, please refer to the [User Guide](USER_GUIDE.md).

## Table of Contents

1. [Administrator Dashboard](#administrator-dashboard)
2. [User Management](#user-management)
3. [Content Oversight](#content-oversight)
4. [System Management](#system-management)
5. [Troubleshooting](#troubleshooting)

## Administrator Dashboard

The Admin Dashboard provides a centralized interface for managing the YoutubeScribe platform:

1. Access the Admin Dashboard by clicking the "Admin" link in the main navigation
2. The dashboard displays key metrics:
   - Total users registered
   - Active users in the past month
   - Total summaries created
   - System resource usage

## User Management

As an administrator, you have capabilities to manage user accounts:

### Viewing Users

1. Navigate to the "Users" tab in the Admin Dashboard
2. View a list of all registered users including:
   - Username
   - Registration date
   - Last activity
   - Admin status

### Creating Invitations

1. Click "Create Invitation" in the User Management section
2. Enter the details for the new user:
   - Email address (optional)
   - Initial username
   - Initial admin status
3. Click "Generate Invitation"
4. Copy the generated invitation link and share it with the intended recipient
5. Invitation links expire after 7 days or after first use

### Managing Admin Privileges

1. To promote a user to administrator:
   - Find the user in the user list
   - Click the "Promote to Admin" button next to their name
   - Confirm the action

2. To demote an administrator to regular user:
   - Find the administrator in the user list
   - Click the "Demote from Admin" button next to their name
   - Confirm the action
   - Note: You cannot demote yourself, and at least one administrator must remain in the system

## Content Oversight

Administrators can view and manage all content in the system:

### Viewing All Summaries

1. Navigate to the "All Summaries" section in the Admin Dashboard
2. Browse all summaries created by any user
3. Use filters to find specific summaries:
   - By user
   - By date range
   - By video source

### Content Moderation

1. To review a specific summary:
   - Click on the summary title in the list
   - View the full summary details
   - See the screenshots and generated content

2. If inappropriate content is identified:
   - Click "Delete Summary" to remove the content
   - A confirmation dialog will appear
   - Enter a reason for deletion (optional)
   - The action will be logged for audit purposes

## System Management

### Database Management

As an administrator, you have access to database backup and restore functionality:

1. **Creating Backups**:
   - Access the "System" tab in the Admin Dashboard
   - Click "Create Backup"
   - The system will generate a database backup file
   - Download the backup file for safekeeping

2. **Restoring from Backup**:
   - Access the "System" tab in the Admin Dashboard
   - Click "Restore Backup"
   - Upload a previously downloaded backup file
   - Confirm the restoration action
   - Note: This will overwrite current data!

Alternatively, you can use the command-line tools:
```bash
# Create a backup
./scripts/db-tools.sh backup

# Restore from a backup
./scripts/db-tools.sh restore
```

### Monitoring System Health

1. Review system logs in the "Logs" section
2. Monitor API usage and rate limits
3. Check CPU and memory utilization
4. View database size and growth metrics

## Troubleshooting

### Common Admin Issues

**User Cannot Access Their Account**
- Check if their account is locked
- Reset their password using the admin tools
- Verify they're using the correct username

**Backup Creation Fails**
- Ensure adequate disk space is available
- Check database connection status
- Review system logs for more specific error messages

**Invitation Links Not Working**
- Verify the link hasn't expired (7-day limit)
- Check if the invitation has already been used
- Regenerate a new invitation if needed

### Emergency Procedures

In case of data integrity issues or security concerns:

1. Create a full database backup immediately
2. Restrict user access temporarily if necessary
3. Review system logs to identify the cause
4. Contact system developers if the issue cannot be resolved

## Best Practices

1. Regularly review user accounts and remove unused accounts
2. Create regular scheduled backups of the database
3. Test restoration from backups in a controlled environment
4. Monitor system logs for unusual activity
5. Keep all dependencies and the application updated
