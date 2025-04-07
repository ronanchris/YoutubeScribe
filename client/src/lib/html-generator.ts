import type { SummaryWithScreenshots } from '../types';

/**
 * Extracts glossary terms from the summary content
 * @param summaryContent The summary text to extract terms from
 * @returns An array of unique glossary terms
 */
function extractGlossaryTerms(summaryContent: string): string[] {
  // Extract terms that appear in quotes, all caps, or look like technical terms
  const quotedTerms = summaryContent.match(/"([^"]+)"/g) || [];
  const allCapsTerms = summaryContent.match(/\b[A-Z][A-Z0-9]{2,}\b/g) || [];
  
  // Extract terms that might be technical (camelCase, PascalCase, or containing numbers)
  const technicalPattern = /\b([A-Z][a-z0-9]+[A-Z]|[a-z]+[A-Z])[a-zA-Z0-9]*\b/g;
  const technicalTerms = summaryContent.match(technicalPattern) || [];
  
  // Combine all terms and remove duplicates
  const allTerms = [
    ...quotedTerms.map(term => term.replace(/"/g, '')),
    ...allCapsTerms,
    ...technicalTerms
  ];
  
  // Remove duplicates and short terms
  return Array.from(new Set(allTerms))
    .filter(term => term.length > 3)
    .slice(0, 10); // Limit to top 10 terms
}

/**
 * Formats a timestamp in seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted timestamp
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates an HTML document for a video summary
 * @param summary The complete summary with screenshots
 * @returns A formatted HTML string
 */
export function generateHTML(summary: SummaryWithScreenshots): string {
  // Extract possible glossary terms
  const glossaryTerms = extractGlossaryTerms(summary.summary);
  
  // Base HTML template with CSS styling
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${summary.videoTitle} - Summary</title>
  <style>
    :root {
      --primary-color: #3b82f6;
      --secondary-color: #f0f9ff;
      --text-color: #334155;
      --light-text: #64748b;
      --border-color: #e2e8f0;
      --heading-color: #1e293b;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1, h2, h3 {
      color: var(--heading-color);
      margin-top: 1.5em;
    }
    
    h1 {
      font-size: 2em;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 5px;
    }
    
    h3 {
      font-size: 1.2em;
    }
    
    a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .video-info {
      background-color: var(--secondary-color);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid var(--primary-color);
    }
    
    .video-link {
      display: inline-block;
      margin-top: 10px;
      font-weight: 500;
    }
    
    .summary-section {
      margin-bottom: 30px;
    }
    
    .key-points {
      list-style-type: none;
      padding-left: 5px;
    }
    
    .key-points li {
      position: relative;
      padding-left: 25px;
      margin-bottom: 10px;
    }
    
    .key-points li:before {
      content: "✓";
      color: var(--primary-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }
    
    .glossary-term {
      background-color: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 2px 6px;
      margin-right: 8px;
      font-size: 0.9em;
      display: inline-block;
      margin-bottom: 5px;
    }
    
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    
    .screenshot {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .screenshot img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .screenshot-info {
      padding: 10px;
      border-top: 1px solid var(--border-color);
      background-color: #f8fafc;
      font-size: 0.9em;
    }
    
    .timestamp {
      color: var(--primary-color);
      font-weight: 500;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      color: var(--light-text);
      font-size: 0.9em;
    }
    
    .outline-section h3 {
      margin-bottom: 10px;
    }
    
    .outline-section ul {
      margin-top: 5px;
      margin-bottom: 20px;
    }
    
    .token-info {
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 0.9em;
      border: 1px solid var(--border-color);
    }
    
    .token-info h3 {
      margin-top: 0;
      font-size: 1.1em;
      color: var(--light-text);
    }
    
    .token-details {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .token-item {
      flex: 1;
      min-width: 180px;
    }
    
    .token-label {
      font-weight: 500;
      color: var(--light-text);
      display: block;
    }
    
    .token-value {
      display: block;
      font-weight: 600;
      color: var(--heading-color);
    }
  </style>
</head>
<body>
  <h1>${summary.videoTitle}</h1>
  
  <div class="video-info">
    <div><strong>Author:</strong> ${summary.videoAuthor}</div>
    <div><strong>Duration:</strong> ${formatTimestamp(summary.videoDuration)}</div>
    <a href="${summary.videoUrl}" target="_blank" class="video-link">Watch on YouTube</a>
  </div>`;

  // Add glossary terms if any were extracted
  if (glossaryTerms.length > 0) {
    html += `
  <div class="summary-section">
    <h2>Glossary Terms</h2>
    <div>
      ${glossaryTerms.map(term => `<span class="glossary-term">${term}</span>`).join('')}
    </div>
  </div>`;
  }

  // Add key points
  html += `
  <div class="summary-section">
    <h2>Key Points</h2>
    <ul class="key-points">
      ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
    </ul>
  </div>`;

  // Add main summary
  html += `
  <div class="summary-section">
    <h2>Summary</h2>
    <div>${summary.summary.replace(/\n/g, '<br>')}</div>
  </div>`;

  // Add structured outline
  html += `
  <div class="summary-section">
    <h2>Structured Outline</h2>
    ${summary.structuredOutline.map(section => `
      <div class="outline-section">
        <h3>${section.title}</h3>
        <ul>
          ${section.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>`;

  // Add screenshots if available
  if (summary.screenshots && summary.screenshots.length > 0) {
    html += `
  <div class="summary-section">
    <h2>Screenshots</h2>
    <div class="screenshots">
      ${summary.screenshots.map(screenshot => `
        <div class="screenshot">
          <img src="${screenshot.imageUrl}" alt="Screenshot at ${formatTimestamp(screenshot.timestamp)}">
          <div class="screenshot-info">
            <span class="timestamp">${formatTimestamp(screenshot.timestamp)}</span>
            ${screenshot.description ? `<div>${screenshot.description}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
  }

  // Add token usage information if available
  if (summary.tokenUsage) {
    html += `
  <div class="token-info">
    <h3>Generation Information</h3>
    <div class="token-details">
      <div class="token-item">
        <span class="token-label">Model</span>
        <span class="token-value">${summary.tokenUsage.model || 'GPT Model'}</span>
      </div>
      <div class="token-item">
        <span class="token-label">Prompt Type</span>
        <span class="token-value">${summary.tokenUsage.prompt_type || summary.promptTemplate || 'Standard'}</span>
      </div>
      <div class="token-item">
        <span class="token-label">Total Tokens</span>
        <span class="token-value">${summary.tokenUsage.total_tokens.toLocaleString()}</span>
      </div>
    </div>
  </div>`;
  }

  // Add footer
  html += `
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString()} - Created with YoutubeScribe</p>
  </div>
</body>
</html>`;

  return html;
}