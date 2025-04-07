# Project Structure Overview

This document outlines the file and directory structure of the `youtube-trans-summary` project.

```
.
├── .env                   # Local environment variables (contains OPENAI_API_KEY). **IGNORED BY GIT**.
├── .git/                  # Hidden directory for Git version control data.
├── .gitignore             # Specifies files/directories for Git to ignore (e.g., .venv, .env).
├── .python-version        # Specifies the Python version for pyenv (3.12.4).
├── .venv/                 # Python virtual environment directory. **IGNORED BY GIT**.
├── docs/                  # Directory for documentation and project meta-files.
│   ├── BRAINSTORMING.md         # Detailed notes, ideas, and brainstorming log.
│   ├── CURSOR_GLOSSARY.md       # Glossary of terms related to the project/tools.
│   ├── CURSOR_PROJECT_CONVENTIONS.md # Guidelines for AI collaboration and project standards.
│   ├── OLD_PROJECTS_CLEANUP.md  # Guide for auditing/cleaning up other projects.
│   ├── PLAN.md                  # High-level project plan and task tracking.
│   └── PROJECT_STRUCTURE.md     # This file - overview of the project layout.
├── process_video.py       # The main Python script for transcription and summarization.
├── README.md              # Top-level project description, setup, and usage instructions.
├── requirements.txt       # List of Python dependencies for the project.
└── summaries/             # Directory where generated summary Markdown files are saved.
    └── azXNHRtzd5s.md         # Example output file (VIDEO_ID.md).
``` 