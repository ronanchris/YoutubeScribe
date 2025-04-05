# YoutubeScribe User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Account Creation](#account-creation)
   - [Logging In](#logging-in)
   - [User Interface Overview](#user-interface-overview)
3. [Core Features](#core-features)
   - [Creating Summaries](#creating-summaries)
   - [Viewing Your Summaries](#viewing-your-summaries)
   - [Summary Details](#summary-details)
   - [Exporting to Markdown](#exporting-to-markdown)
4. [User Management](#user-management)
   - [User Roles](#user-roles)
   - [Adding Users Directly](#adding-users-directly)
   - [Inviting Users](#inviting-users)
   - [Accepting Invitations](#accepting-invitations)
5. [Administrator Functions](#administrator-functions)
   - [Admin Dashboard](#admin-dashboard)
   - [Managing Users](#managing-users)
   - [Promoting/Demoting Admins](#promotingdemoting-admins)
   - [Viewing All Summaries](#viewing-all-summaries)
6. [Technical Details](#technical-details)
   - [AI Processing](#ai-processing)
   - [Screenshot Detection](#screenshot-detection)
   - [Data Security](#data-security)
7. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Support Contact](#support-contact)

## Introduction

YoutubeScribe is a powerful web application designed to extract, summarize, and organize content from YouTube videos using advanced AI technology. The application automatically generates comprehensive summaries, extracts key points, and identifies important visual elements from videos, saving you time and enhancing your understanding of video content.

### Key Capabilities

- **AI-Powered Summarization**: Automatically generate concise summaries of video content
- **Key Point Extraction**: Identify and list the most important points from videos
- **Intelligent Screenshot Detection**: Capture and analyze diagrams and visual elements
- **Collaborative Management**: Share and organize summaries with team members
- **Markdown Export**: Export summaries for integration with note-taking systems

## Getting Started

### Account Creation

There are two ways to create an account in YoutubeScribe:

1. **Direct Registration**: The first user who registers becomes an administrator
2. **Invitation**: Receiving an invitation link from an existing administrator

#### First-User Registration

If you're the first user of a new YoutubeScribe instance:

1. Navigate to the login page
2. Click "Register" to create your account
3. Enter your username and password
4. Submit the form to create your account with administrator privileges

### Logging In

1. Navigate to the application login page
2. Enter your username and password 
3. Click "Login" to access your account

### User Interface Overview

The YoutubeScribe interface consists of several key areas:

- **Navigation Bar**: Access different sections of the application
- **Summary Creation**: Input YouTube URLs to generate new summaries
- **Summary History**: View your previously created summaries
- **Admin Console**: (Administrators only) Manage users and system settings

## Core Features

### Creating Summaries

To create a new summary from a YouTube video:

1. Navigate to the home page
2. Enter a valid YouTube URL in the input field
3. Click "Generate Summary"
4. Wait while the system processes the video (this may take 1-2 minutes depending on video length)
5. Review the generated summary, which includes:
   - Video title and author information
   - Key points extracted from the content
   - Comprehensive summary text
   - Structured outline of topics
   - Important screenshots with timestamps

### Viewing Your Summaries

Access your summary history:

1. Click on "History" in the navigation bar
2. Browse through your previously created summaries
3. Use the search function to find specific summaries
4. Click on any summary card to view its details

### Summary Details

Each summary page contains:

- **Video Information**: Title, author, duration, and thumbnail
- **Key Points**: Bullet points of the most important information
- **Detailed Summary**: Comprehensive overview of the video content
- **Structured Outline**: Hierarchical breakdown of topics covered
- **Screenshots Gallery**: Visual elements extracted from the video with timestamps
- **Screenshot Descriptions**: AI-generated descriptions of visual content

### Exporting to Markdown

To export a summary to Markdown format:

1. Open the summary details page
2. Click the "Export to Markdown" button
3. Choose where to save the exported file
4. The Markdown file will include all summary text and references to screenshots

## User Management

### User Roles

YoutubeScribe has two user roles with different permissions:

#### Regular Users
- Can create and view their own summaries
- Cannot view summaries created by other users
- Cannot access the admin dashboard or user management functions

#### Administrators
- Can create and view their own summaries
- Can view summaries created by all users
- Can manage users (add, invite, promote, demote, delete)
- Can access the admin dashboard

### Adding Users Directly

Administrators can add users directly with predefined credentials:

1. Navigate to the Admin Dashboard
2. Click the "Add User" button
3. Enter the new user's username
4. Create a password for the user
5. Select whether the user should be an administrator
6. Click "Create User"

The new user can immediately log in with these credentials. This method is useful when quickly setting up accounts for internal team members.

### Inviting Users

The invitation system provides a more secure way to add users:

1. Navigate to the Admin Dashboard
2. Click the "Invite User" button
3. Enter the email address (which will become the username)
4. Select whether the user should have administrator privileges
5. Click "Send Invitation"
6. Copy the generated invitation link
7. Share the invitation link with the user (via email or other communication)

Benefits of using invitations:
- The admin doesn't need to create or share passwords
- Users set their own passwords directly
- Invitation links expire after 7 days for security
- More secure for external collaborators

### Accepting Invitations

If you've received an invitation:

1. Click the invitation link you received
2. The system validates your invitation token
3. If valid, you'll be prompted to create a new password
4. After setting your password, you'll be automatically logged in
5. Your account is now active with the permissions assigned by the administrator

## Administrator Functions

### Admin Dashboard

The administrator dashboard provides tools for managing the application:

1. Access by clicking "Admin" in the navigation bar (visible only to administrators)
2. View a list of all registered users
3. Access user management functions
4. Monitor system usage statistics

### Managing Users

Administrators can manage users in several ways:

- **Add User**: Create new accounts directly with predefined credentials
- **Invite User**: Generate invitation links for secure self-registration
- **Delete User**: Remove user accounts from the system
- **Edit User**: Modify user information and permissions
- **Regenerate Invitation**: Create a new invitation link for a pending user

### Promoting/Demoting Admins

To change a user's administrator status:

1. Navigate to the Admin Dashboard
2. Find the user in the users list
3. Click "Promote to Admin" or "Demote from Admin"
4. Confirm the action when prompted

### Viewing All Summaries

Administrators can access summaries created by all users:

1. Navigate to the History page
2. All summaries in the system will be visible (both your own and those created by others)
3. User information is displayed on each summary card
4. Filter summaries by user if needed

## Technical Details

### AI Processing

YoutubeScribe uses advanced AI technology to process video content:

- **Transcript Extraction**: Automatically retrieves video transcripts from YouTube
- **OpenAI Integration**: Uses GPT-4o to analyze and summarize content
- **Structured Data Generation**: Creates organized outlines and key points
- **Intelligent Analysis**: Identifies the most relevant information

### Screenshot Detection

The screenshot extraction process:

1. Analyzes video content at regular intervals
2. Identifies frames containing important visual information
3. Processes images to enhance text and diagrams
4. Uses AI to generate descriptions of visual content
5. Associates screenshots with specific timestamps in the video

### Data Security

YoutubeScribe prioritizes the security of your data:

- **User Isolation**: Users can only access their own summaries
- **Secure Authentication**: Password hashing and secure session management
- **Expiring Invitations**: Invitation tokens that expire after 7 days
- **Role-Based Access**: Permissions restricted based on user roles

## Troubleshooting

### Common Issues

**Problem**: Invitation link doesn't work  
**Solution**: Invitation links expire after 7 days. Ask an administrator to regenerate your invitation.

**Problem**: Summary generation takes too long  
**Solution**: Processing time depends on video length. Longer videos may take several minutes to process.

**Problem**: Screenshots aren't displaying properly  
**Solution**: Ensure you have a stable internet connection. Try refreshing the page.

### Support Contact

For additional support, please contact your system administrator.