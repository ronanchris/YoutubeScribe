# GitHub Integration Guide

This document outlines how to work with the YoutubeScribe GitHub repository.

## Repository Information

- **Repository**: https://github.com/ronanchris/YoutubeScribe
- **Access**: Private repository, requires authentication

## Authentication

GitHub authentication is handled via personal access tokens. The repository is configured with a token stored in the `GITHUB_TOKEN` environment secret.

## Workflow

### Cloning the Repository

```bash
git clone https://github.com/ronanchris/YoutubeScribe.git
# When prompted for authentication, use your GitHub token as the password
```

### Pushing Changes

```bash
# Add changes
git add .

# Commit changes
git commit -m "Your descriptive commit message"

# Push to main branch
git push -u origin main
```

### Creating Branches (For Feature Development)

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Push the branch to GitHub
git push -u origin feature/your-feature-name
```

## Backup & Sync with Replit

The GitHub repository serves as a backup and version control solution for code developed on Replit. 

### Best Practices

1. **Regular Commits**: Make small, focused commits with descriptive messages
2. **Push After Significant Changes**: Push to GitHub after completing significant features
3. **Use Pull Requests**: For major changes, consider using pull requests instead of committing directly to main
4. **Keep Database Backups Separate**: Database backups are not committed to the repository; use the backup scripts instead

## Troubleshooting

If you encounter authentication issues:

1. Verify that the `GITHUB_TOKEN` secret is properly set in Replit
2. Ensure the token has appropriate permissions (repo, workflow)
3. Check that the token is not expired

If you need to update the token:

1. Generate a new token in GitHub
2. Update the `GITHUB_TOKEN` secret in Replit
3. Run `git remote remove origin` and then set up the remote again

## Related Documentation

- [DEPLOYMENT_NOTES.md](./DEPLOYMENT_NOTES.md) - Information about deployment considerations
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Overview of project file structure