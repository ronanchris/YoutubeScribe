<!--
# Example Prompt to Use with AI Assistant:

"Hi, please help me fill out this DEPLOYMENT_NOTES_TEMPLATE.md for the current project.

Let's go section by section. Start by helping me determine the details for Section 1: Runtime Environment based on the project files (e.g., check for .python-version, requirements.txt, package.json engines, etc.)."

(Then, for subsequent sections, ask specifically, e.g., "Now let's look at Section 2: System Dependencies. Can you scan the code [specify main script file(s)] for any system calls or libraries that wrap system tools like Tesseract or ffmpeg?")
-->

# Deployment Considerations: [Project Name]

This document outlines the deployment requirements for the [Project Name] project.

## 1. Runtime Environment
*   **Language:** [e.g., Python, Node.js, Go]
*   **Version:** [e.g., 3.10.x, >=18.0.0] (Check `.python-version`, `runtime.txt`, `package.json engines`, Dockerfile, etc.)

## 2. System Dependencies
*   [List any required non-language tools/libraries, e.g., `ffmpeg`, `tesseract-ocr`, `postgresql-client`]
*   *(If none, state "None identified.")*
*   *(Check code for system calls, library wrappers like pytesseract, Dockerfile, README setup steps)*

## 3. Application Type
*   **Type:** [e.g., Command-line script, Flask web API, Express web server, Streamlit app, Background worker]
*   **Entry Point:** [How is it run? e.g., `python main.py`, `gunicorn app:app`, `streamlit run app.py`, `node server.js`]
*   **Notes:** [e.g., Persistent web server needed? Runs as batch job?]

## 4. Data Storage
*   **Type:** [e.g., Local file system, PostgreSQL, MongoDB, Redis, AWS S3, None]
*   **Details:** [Where is data read/written? Specific database/service? e.g., Reads config from `./config.json`, Writes logs to `/var/log/app.log`, Connects to PostgreSQL database named 'users']
*   **Persistence:** [Are files/data expected to persist between runs/deployments?]
*   **Database:** [Specify if needed, e.g., PostgreSQL >= 14]

## 5. External Services & Networking
*   **Services:** [List external APIs/services called, e.g., Stripe API, Google Maps API, OpenAI API]
*   **Networking:** [e.g., Requires outbound HTTPS access, Needs specific ports open inbound?]

## 6. Secrets Management
*   **Method:** [e.g., Environment Variables, AWS Secrets Manager, HashiCorp Vault, .env file (local only)]
*   **Details:** [List specific secret names needed, e.g., `STRIPE_SECRET_KEY`, `DATABASE_URL`, `API_TOKEN`]
*   *(Check code for `os.getenv`, `process.env`, dotenv usage, specific SDKs)*

## 7. Resource Needs (Estimate)
*   **CPU:** [e.g., Low, Medium, High] (Consider computational intensity)
*   **RAM:** [e.g., Low (<512MB), Medium (1-2GB), High (>2GB)] (Consider data loaded into memory)
*   **Disk:** [e.g., Minimal, Moderate (for logs/cache), Large (for data files)] 