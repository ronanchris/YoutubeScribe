# YoutubeScribe Prompt Templates Guide

This documentation provides a comprehensive overview of the prompt templates used in YoutubeScribe for summarizing YouTube videos with AI.

## Overview

YoutubeScribe uses different prompt templates to generate summaries tailored to specific needs. Each template instructs the AI model to analyze video transcripts in different ways, producing summaries with varied focus, depth, and style.

## Available Prompt Templates

### Standard
The default prompt template focuses on extracting specific content from videos in a balanced way.

- **Key Features:**
  - Extracts specific advice, strategies, techniques, and insights
  - Creates 5-10 specific key points
  - Generates 3-5 paragraph summary with concrete information
  - Provides a hierarchical structured outline of the content

- **Best For:**
  - General purpose video summarization
  - Videos with practical advice or instruction
  - Content where specific details matter

### Detailed
An in-depth analysis template that provides comprehensive coverage of the video content.

- **Key Features:**
  - Creates 8-12 thorough key points with specific advice
  - Generates 4-6 detailed paragraphs with concrete examples
  - Provides a detailed structured outline with hierarchical sections
  - Highlights technical terms and specialized knowledge

- **Best For:**
  - Longer, content-rich videos
  - Educational or instructional content
  - Videos with complex ideas that require thorough explanation

### Concise
A brief, high-impact summary that captures only essential elements.

- **Key Features:**
  - Focuses on 3-5 critical key points
  - Provides a brief 1-2 paragraph executive summary
  - Creates a minimal outline with main sections only

- **Best For:**
  - Quick overviews of video content
  - Videos where only the core message is needed
  - Situations where brevity is valued over detail

### Business
An analysis through a business/professional lens.

- **Key Features:**
  - Identifies 5-8 business insights and actionable takeaways
  - Creates a 2-3 paragraph summary focused on business relevance
  - Structures content in a business-friendly format
  - Highlights strategic implications and market trends

- **Best For:**
  - Business presentations and talks
  - Strategy discussions and market analyses
  - Corporate training videos

### Academic
A scholarly approach to video content analysis.

- **Key Features:**
  - Identifies 5-10 theoretical concepts and research findings
  - Creates a 3-4 paragraph scholarly summary
  - Structures content with attention to methodology and evidence
  - Notes limitations and areas for further research

- **Best For:**
  - Academic lectures and presentations
  - Research discussions and methodologies
  - Educational content with theoretical focus

### Technical AI
A specialized template for analyzing AI-related videos with technical precision.

- **Key Features:**
  - Extracts technical details about AI models and systems
  - Focuses on architecture, performance, capabilities, and limitations
  - Includes industry applications and ethical considerations
  - Provides detailed technical specifications when available

- **Best For:**
  - AI research presentations
  - Technical discussions of language models
  - Videos about machine learning systems and architecture

## Output Format

All prompt templates generate output in a consistent JSON format:

```json
{
  "keyPoints": ["Point 1", "Point 2", ...],
  "summary": "Comprehensive summary text...",
  "structuredOutline": [
    {
      "title": "Section Title",
      "items": ["Item 1", "Item 2", ...]
    },
    ...
  ]
}
```

## Regenerating Summaries

Users can regenerate summaries using different templates without fetching the transcript again, allowing experimentation with different summary styles without additional API costs.

## Implementation Details

The prompt templates are defined in `server/services/openai.ts` and are accessible through the prompt selector component in the user interface (`client/src/components/prompt-selector.tsx`).

## Best Practices

1. **Choose the right template for the content**: Select a template that matches the video's purpose and style.
2. **Consider audience needs**: Technical audiences may benefit from the detailed or technical_ai templates.
3. **For AI videos**: Use the technical_ai template to extract specific model details and technical aspects.
4. **For business content**: The business template will emphasize actionable insights and strategic implications.
5. **For academic content**: The academic template provides proper scholarly framing and theoretical analysis.

## Template Customization

If the existing templates don't meet your needs, custom templates can be added to the `PROMPT_TEMPLATES` object in `server/services/openai.ts`. Each template requires:

1. A unique identifier
2. A system prompt that guides the AI's analysis
3. Registration in the promptTypes array in the prompt-selector component
