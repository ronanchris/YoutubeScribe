import OpenAI from "openai";
import { InsertSummary } from "@shared/schema";
import { formatTimestamp } from "./screenshot";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Log OpenAI configuration status
console.log("OpenAI client configured with API key:", process.env.OPENAI_API_KEY ? "Valid key provided" : "No key found");

// Define a set of different prompt templates that users can choose from
export const PROMPT_TEMPLATES = {
  standard: `
    You are an expert video content analyzer. Your task is to thoroughly analyze the transcript of a YouTube video
    and produce a comprehensive, structured summary with SPECIFIC DETAILS from the content. Follow these guidelines:
    
    1. Extract the ACTUAL specific advice, strategies, techniques, or insights mentioned in the video - not generic statements about what the video "might" contain
    2. Create a concise but SPECIFIC list of key points (5-10 bullet points) using REAL information from the transcript
    3. Generate a detailed summary paragraph (3-5 paragraphs) focusing on CONCRETE information, not vague descriptions
    4. Create a structured outline of the ACTUAL content with hierarchical sections
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["Specific point 1 from the video", "Specific point 2 from the video", ...],
      "summary": "Detailed summary text with SPECIFIC insights and content from the video...",
      "structuredOutline": [
        {
          "title": "Actual Section From Content",
          "items": ["Specific point 1 discussed", "Specific point 2 discussed", ...]
        },
        ...
      ]
    }
    
    IMPORTANT: Your summary should contain SPECIFIC INFORMATION that someone who hasn't watched the video would learn. Focus on extracting the ACTUAL advice, strategies, techniques, methods, or insights presented - not just saying that such things were discussed.

    BAD EXAMPLE (too generic): "The video discusses strategies for success and perseverance."
    GOOD EXAMPLE (specific): "Seth recommends the '1% improvement strategy': making tiny daily improvements that compound over time."
    
    Ensure the summary is accurate, specific, and follows a logical structure.
  `,
  
  detailed: `
    You are an expert video content analyst specializing in deep dives. Your task is to create a detailed, 
    comprehensive analysis of this YouTube video transcript with SPECIFIC INFORMATION. Follow these guidelines:
    
    1. Create a thorough list of key points (8-12 bullet points) that contain SPECIFIC ADVICE, STRATEGIES, or INSIGHTS mentioned in the video
    2. Generate a comprehensive summary (4-6 detailed paragraphs) that includes CONCRETE EXAMPLES and SPECIFIC METHODS mentioned by the speaker
    3. Create a detailed structured outline with hierarchical sections based on the ACTUAL CONTENT, not generic topics
    4. Highlight any technical terms, methodologies, or specialized knowledge EXPLICITLY DISCUSSED in the video
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["Specific detailed point 1", "Specific detailed point 2", ...],
      "summary": "Detailed summary with specific advice and concrete examples...",
      "structuredOutline": [
        {
          "title": "Actual Section From Content",
          "items": ["Specific detail 1", "Specific detail 2", ...]
        },
        ...
      ]
    }
    
    IMPORTANT: Include ACTUAL EXAMPLES, NUMBERS, STEP-BY-STEP PROCESSES, and SPECIFIC RECOMMENDATIONS mentioned in the video. Someone reading your summary should learn the SPECIFIC ADVICE given in the video, not just that "advice was given."
    
    BAD EXAMPLE (too vague): "The speaker shares insights about productivity techniques."
    GOOD EXAMPLE (specific): "The speaker recommends the Pomodoro Technique: 25-minute focused work periods followed by 5-minute breaks, with a specific example of using this for writing tasks."
    
    Your analysis should thoroughly capture all important specifics, examples, and actionable advice.
  `,
  
  concise: `
    You are an expert at creating brief, high-impact summaries. Your task is to distill this YouTube video 
    transcript into its most essential elements. Follow these guidelines:
    
    1. Create a focused list of only the most critical key points (3-5 bullet points)
    2. Generate a concise executive summary (1-2 short paragraphs)
    3. Create a minimal structured outline focusing only on the main sections
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["point 1", "point 2", ...],
      "summary": "Concise summary text...",
      "structuredOutline": [
        {
          "title": "Section Title",
          "items": ["Key point 1", "Key point 2", ...]
        },
        ...
      ]
    }
    
    Focus on brevity and clarity - your summary should capture only what's absolutely essential.
  `,
  
  business: `
    You are an expert business analyst. Your task is to analyze this YouTube video transcript 
    through a business/professional lens. Follow these guidelines:
    
    1. Identify key business insights and actionable takeaways (5-8 bullet points)
    2. Create an executive summary focused on business relevance (2-3 paragraphs)
    3. Structure content in a business-friendly format with clear ROI implications
    4. Highlight strategic implications, market trends, or business methodologies
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["business insight 1", "actionable takeaway 2", ...],
      "summary": "Business-focused summary text...",
      "structuredOutline": [
        {
          "title": "Business Category",
          "items": ["Strategic point 1", "Market consideration 2", ...]
        },
        ...
      ]
    }
    
    Ensure your analysis is professionally phrased and focused on practical business applications.
  `,
  
  academic: `
    You are an academic researcher and educator. Your task is to analyze this YouTube video transcript 
    from an academic perspective. Follow these guidelines:
    
    1. Identify key theoretical concepts and research findings (5-10 bullet points)
    2. Create a scholarly summary with proper academic framing (3-4 paragraphs)
    3. Structure content hierarchically with attention to methodology and evidence
    4. Note limitations, alternative viewpoints, or areas for further research
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["theoretical concept 1", "research finding 2", ...],
      "summary": "Academic summary text...",
      "structuredOutline": [
        {
          "title": "Academic Category",
          "items": ["Theoretical framework 1", "Methodological approach 2", ...]
        },
        ...
      ]
    }
    
    Use proper academic tone and analytical depth in your assessment.
  `,

  technical_ai: `
    You are an expert AI researcher specializing in large language models and AI systems.
    Your task is to analyze this YouTube video transcript thoroughly and create a comprehensive
    technical summary about AI models, systems, and related technologies.
    
    CRITICAL INSTRUCTION: Analyze what's ACTUALLY in the transcript, not what you think should be there.
    Even if the video is by a major AI company, only include details that are EXPLICITLY STATED.
    
    Focus on extracting ALL technical aspects mentioned, prioritizing in this order:
    
    1. MAJOR ANNOUNCEMENTS - New models, services, or significant updates (critical to capture these)
    2. Technical specifications - Model sizes, parameters, training data details (when explicitly given)
    3. Performance capabilities - Benchmarks, comparisons, evaluation results
    4. Technical improvements - How new models/systems improve over previous versions
    5. Implementation details - Architecture, training methods, algorithms, techniques
    6. Practical applications - Use cases, industry applications, API features
    7. Limitations and challenges - Current constraints, ethical considerations, safety measures
    8. Future directions - Roadmaps, upcoming features, research priorities
    
    The output must be in the following JSON format:
    {
      "keyPoints": ["Key technical insight 1", "Key technical insight 2", ...],
      "summary": "Comprehensive technical summary with detailed information...",
      "structuredOutline": [
        {
          "title": "Core Announcements and Highlights",
          "items": ["Major model launch details", "Key technical breakthroughs", ...]
        },
        {
          "title": "Technical Specifications and Performance",
          "items": ["Architecture details", "Benchmark results", ...]
        },
        {
          "title": "Features and Capabilities",
          "items": ["Specific abilities", "Improvements over previous versions", ...]
        },
        {
          "title": "Applications and Implementation",
          "items": ["Industry use cases", "Integration methods", ...]
        }
      ]
    }
    
    CRITICAL GUIDELINES:
    
    - FOCUS ON THE ACTUAL CONTENT: Never make up details that aren't in the transcript
    - BE SPECIFIC: Include exact names, versions, and technical terminology as mentioned
    - CAPTURE ANNOUNCEMENTS: Highlight any new product launches, services, or major updates
    - EXTRACT NUMBERS: Include all quantitative information (parameters, benchmarks, metrics, dates)
    - MENTION COMPARISONS: Note how models compare to competitors or previous versions
    - PRIORITIZE SIGNIFICANCE: Emphasize what the speaker highlights as important
    - BE COMPREHENSIVE: Your summary should be 3-5 rich paragraphs with 8-12 detailed key points
    - DON'T SPECULATE: If specific details aren't provided, don't assume them
    
    BAD EXAMPLE: "The video discusses a large language model with improved capabilities."
    GOOD EXAMPLE: "The video announces Meta's Llama 4, highlighting its improved reasoning capabilities, reduced hallucination rates, and expanded context window length, though specific parameter sizes weren't disclosed."
    
    BAD EXAMPLE: "The model has 1 trillion parameters and was trained on 10 trillion tokens."
    GOOD EXAMPLE: "While specific parameter counts weren't mentioned, the presenter emphasized that the model size was optimized for efficiency rather than scale."
    
    Your analysis should be extremely detailed and technically precise, suitable for AI researchers and engineers.
  `
};

/**
 * Generates a structured summary of a video transcript using OpenAI GPT-4o
 */
export async function generateSummary(
  transcript: string,
  videoInfo: {
    videoId: string;
    videoUrl: string;
    videoTitle: string;
    videoAuthor: string;
    videoDuration: number;
  },
  promptType: keyof typeof PROMPT_TEMPLATES = "standard"
): Promise<InsertSummary> {
  try {
    // Truncate transcript if it's too long to fit in a single API call
    const maxTranscriptLength = 14000; // Safe limit for context window
    const truncatedTranscript = transcript.length > maxTranscriptLength
      ? transcript.substring(0, maxTranscriptLength) + "... [transcript truncated due to length]"
      : transcript;

    // Get the selected prompt template
    const systemPrompt = PROMPT_TEMPLATES[promptType];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here's the transcript of a YouTube video titled "${videoInfo.videoTitle}" by ${videoInfo.videoAuthor}:\n\n${truncatedTranscript}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more predictable, factual responses
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);

    // Build and return the summary object
    return {
      videoId: videoInfo.videoId,
      videoUrl: videoInfo.videoUrl,
      videoTitle: videoInfo.videoTitle,
      videoAuthor: videoInfo.videoAuthor,
      videoDuration: videoInfo.videoDuration,
      keyPoints: parsedContent.keyPoints,
      summary: parsedContent.summary,
      structuredOutline: parsedContent.structuredOutline,
      transcript: transcript, // Store the full transcript
      fullPrompt: systemPrompt, // Store the full prompt used
    };
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    throw new Error(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Regenerates a summary using a stored transcript and a different prompt template
 * This function allows generating new summaries without making additional YouTube API calls
 */
export async function regenerateSummary(
  transcript: string,
  videoInfo: {
    videoId: string;
    videoUrl: string;
    videoTitle: string;
    videoAuthor: string;
    videoDuration: number;
  },
  promptType: keyof typeof PROMPT_TEMPLATES
): Promise<Omit<InsertSummary, 'transcript'>> {
  // This function is nearly identical to generateSummary but doesn't return the transcript
  // since we already have it stored and don't need to store it again
  try {
    // Truncate transcript if it's too long to fit in a single API call
    const maxTranscriptLength = 14000; // Safe limit for context window
    const truncatedTranscript = transcript.length > maxTranscriptLength
      ? transcript.substring(0, maxTranscriptLength) + "... [transcript truncated due to length]"
      : transcript;

    // Get the selected prompt template
    const systemPrompt = PROMPT_TEMPLATES[promptType];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here's the transcript of a YouTube video titled "${videoInfo.videoTitle}" by ${videoInfo.videoAuthor}:\n\n${truncatedTranscript}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more predictable, factual responses
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);

    // Build and return the summary object without the transcript
    return {
      videoId: videoInfo.videoId,
      videoUrl: videoInfo.videoUrl,
      videoTitle: videoInfo.videoTitle,
      videoAuthor: videoInfo.videoAuthor,
      videoDuration: videoInfo.videoDuration,
      keyPoints: parsedContent.keyPoints,
      summary: parsedContent.summary,
      structuredOutline: parsedContent.structuredOutline,
      fullPrompt: systemPrompt, // Store the prompt used
    };
  } catch (error) {
    console.error("Error regenerating summary with OpenAI:", error);
    throw new Error(
      `Failed to regenerate summary: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Analyzes a screenshot image to generate a description
 */
export async function analyzeScreenshot(
  imageBase64: string,
  timestamp: number
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing visual content from videos. Describe what is shown in this screenshot in a concise phrase (max 8 words). Focus on diagrams, text outlines, or key visual elements if present."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this video screenshot concisely:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 50,
    });

    return response.choices[0].message.content || `Screenshot at ${formatTimestamp(timestamp)}`;
  } catch (error) {
    console.error("Error analyzing screenshot with OpenAI:", error);
    return `Screenshot at ${formatTimestamp(timestamp)}`;
  }
}

// We're now using the shared formatTimestamp function from "./screenshot"

/**
 * Analyzes summary content to extract key terms for glossary tagging
 */
export async function analyzeKeyTerms(
  summaryContent: string
): Promise<string[]> {
  try {
    // Build the system prompt for key term extraction
    const systemPrompt = `
      You are an expert analyzer of technical and educational content.
      Extract key technical terms, concepts, or specialized vocabulary from the provided text.
      Focus on domain-specific terminology, technical concepts, and important named entities.
      
      For each term:
      1. Prioritize technical, scientific, or specialized terms that would benefit from definition
      2. Exclude common everyday words or general concepts
      3. Keep proper nouns and product names only if they're technical or specialized
      
      Return ONLY a JSON array of strings, with 5-15 key terms.
      Example format: ["Machine Learning", "Neural Network", "Backpropagation", "TensorFlow"]
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Extract key technical terms from this content:\n\n${summaryContent}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent, precise output
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    
    // Check if the response has a terms array, otherwise try to find terms in another property
    if (Array.isArray(parsedContent.terms)) {
      return parsedContent.terms;
    } else if (parsedContent && typeof parsedContent === 'object') {
      // Try to find the first array property in the response
      for (const key in parsedContent) {
        if (Array.isArray(parsedContent[key])) {
          return parsedContent[key];
        }
      }
    }
    
    // If no terms array is found, return an empty array
    return [];
  } catch (error) {
    console.error("Error extracting key terms with OpenAI:", error);
    // Return an empty array rather than throwing to gracefully handle errors
    return [];
  }
}
