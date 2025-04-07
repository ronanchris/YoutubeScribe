# YoutubeScribe User Guide

Welcome to YoutubeScribe, an AI-powered YouTube video summarization tool. This guide will help you understand how to use the application effectively.

> **Note**: If you are an administrator, please also refer to the [Administrator Guide](ADMIN_GUIDE.md) for additional functionality.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Summaries](#creating-summaries)
3. [Viewing History](#viewing-history)
4. [Managing Your Account](#managing-your-account)
5. [Working with Summaries](#working-with-summaries)
6. [Troubleshooting](#troubleshooting)
7. [Data Management](#data-management)

## Getting Started

### Logging In

1. Access the application through your provided URL
2. Enter your username and password
3. If you received an invitation, use the link in your invitation email to set up your account

### Navigation

The main navigation menu provides access to all key functions:

- **Home**: Create new video summaries
- **History**: View your previously created summaries

## Creating Summaries

1. From the Home page, paste a YouTube URL into the input field
2. Click "Analyze Video" to begin the process
3. The system will:
   - Extract the video transcript
   - Generate an AI-powered summary
   - Capture key screenshots
4. Once processing is complete, you'll be shown the summary results

## Viewing History

The History page shows all summaries you've created:

- Each summary card displays the video title, date created, and a preview
- Click on any summary to view the full details
- Use the search and filter options to find specific summaries

## Managing Your Account

- Change your password through the profile settings
- Manage your notification preferences
- View your usage statistics

## Working with Summaries

### Customizing Summaries

After a summary is generated, you can:

- Change the summary style using different prompt templates
- Add custom screenshots at specific timestamps
- Extract glossary terms from technical content
- Export the summary in various formats

### Adding Screenshots

1. Open a summary from your history
2. Scroll to the video frame scrubber
3. Move to the desired timestamp
4. Click "Capture Screenshot"
5. Add an optional description
6. The new screenshot will be added to your summary

## Troubleshooting

### Common Issues

**Video Cannot Be Processed**
- Ensure the YouTube URL is valid and the video is publicly accessible
- Some videos may have disabled transcripts or are in unsupported languages

**Summary Generation Failed**
- Try regenerating the summary
- Very long videos may take more time to process

**Account Access Problems**
- Use the password reset function
- Contact your administrator if your account is locked

## Data Management

YoutubeScribe stores all your summaries in a database. Here's what you need to know:

### Data Consistency

- The application automatically synchronizes data across different devices
- When you make changes on one device, they will appear on your other devices after refreshing
- The system automatically refreshes data when a browser tab regains focus

### Data Privacy

- Your summaries are private and only visible to you
- Administrators can access summaries for support purposes
- Data is stored securely in the system database

### Data Export

- You can export your summaries in various formats:
  - Markdown (for documentation)
  - Plain text (for simple sharing)
  - HTML (for web publishing)

### Data Retention

- Your summaries are retained indefinitely unless you delete them
- Deleted summaries cannot be recovered by users
- Contact an administrator if you need to recover accidentally deleted content
