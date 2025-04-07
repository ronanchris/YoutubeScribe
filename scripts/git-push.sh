#!/bin/bash

# Script to simplify pushing to GitHub with token authentication
# Usage: ./scripts/git-push.sh "Your commit message"

# Store GitHub token credentials (temporary)
git config --local credential.helper store
echo "https://x-access-token:${GITHUB_TOKEN}@github.com" > ~/.git-credentials
chmod 600 ~/.git-credentials

# Get commit message from argument or prompt
COMMIT_MESSAGE="$1"
if [ -z "$COMMIT_MESSAGE" ]; then
  read -p "Enter commit message: " COMMIT_MESSAGE
fi

# Add all changes
git add .

# Commit with provided message
git commit -m "$COMMIT_MESSAGE"

# Push to remote repository
git push origin main

echo "Changes successfully pushed to GitHub!"