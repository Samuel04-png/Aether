// DeepSeek API Service
// DeepSeek uses OpenAI-compatible API format

const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;

if (!apiKey) {
  console.error("VITE_DEEPSEEK_API_KEY environment variable not set.");
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

async function callDeepSeek(messages: DeepSeekMessage[], options: { 
  temperature?: number; 
  maxTokens?: number;
  jsonMode?: boolean;
} = {}): Promise<string> {
  if (!apiKey) {
    throw new Error("DeepSeek API key not configured");
  }

  const requestBody: DeepSeekRequest = {
    model: 'deepseek-chat',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2000,
  };

  if (options.jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      } else if (response.status === 503) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Please check your DeepSeek API key.");
      }
      
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

export const summarizeText = async (textToSummarize: string): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are an expert business analyst. Summarize news articles for small business owners focusing on key takeaways, potential impact, and actionable insights.'
    },
    {
      role: 'user',
      content: `Summarize the following news article. Focus on the key takeaways, potential impact, and actionable insights. Keep it concise and clear, using bullet points for the main takeaways. Article: "${textToSummarize}"`
    }
  ];

  try {
    return await callDeepSeek(messages);
  } catch (error: any) {
    console.error("Error summarizing text with DeepSeek API:", error);
    throw new Error("Could not summarize the article. Please try again later.");
  }
};

export const createTasksFromPrompt = async (prompt: string): Promise<any> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are a task extraction AI. Analyze text and extract actionable tasks with title, description, and due date. Return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Analyze the following text and extract actionable tasks. Return a JSON array with objects containing: title (string), description (string), and dueDate (string in YYYY-MM-DD format, or null). Text: "${prompt}"`
    }
  ];
  
  try {
    const response = await callDeepSeek(messages, { jsonMode: true });
    return JSON.parse(response);
  } catch (error) {
    console.error("Error creating tasks with DeepSeek API:", error);
    return { error: "Could not generate tasks. Please try again." };
  }
};

export const generateSocialPost = async (topic: string, platform: string, tone: string): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are a professional social media manager who creates engaging posts for small businesses.'
    },
    {
      role: 'user',
      content: `Write a social media post for a small business.
Platform: ${platform}
Topic: ${topic}
Tone: ${tone}

Keep the post concise, engaging, and relevant for the specified platform. Include relevant hashtags.`
    }
  ];

  try {
    return await callDeepSeek(messages);
  } catch (error: any) {
    console.error("Error generating social post with DeepSeek API:", error);
    throw new Error("Could not generate the post. Please try again.");
  }
};

export const generateEnhancedImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  // DeepSeek doesn't support image generation in the same way as Gemini
  // This would need a different service like DALL-E or Stable Diffusion
  throw new Error("Image generation is not supported with DeepSeek API. Please use a dedicated image generation service.");
};

export interface WebsiteAuditResult {
  recommendations: Array<{
    title: string;
    category: 'SEO' | 'Performance' | 'Content' | 'Accessibility' | 'Security';
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    impact: string;
  }>;
  findings: {
    hasMetaDescription: boolean;
    hasOpenGraphTags: boolean;
    hasSchemaMarkup: boolean;
    isHTTPS: boolean;
    domainAge: string;
    mobileFriendly: boolean;
    pageSpeed: string;
    seoScore: number;
    performanceScore: number;
    accessibilityScore: number;
  };
  scores: {
    overall: number;
    seo: number;
    performance: number;
    accessibility: number;
  };
  insights: string[];
}

export const generateWebsiteAudit = async (url: string): Promise<WebsiteAuditResult> => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    throw new Error('Invalid URL format. Please enter a valid website URL.');
  }

  const domain = parsedUrl.hostname;
  const isHTTPS = parsedUrl.protocol === 'https:';
  const hasSubdomain = parsedUrl.hostname.split('.').length > 2;
  const path = parsedUrl.pathname;

  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are an expert SEO, web performance, and accessibility analyst. Return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Analyze the website: ${url}

Domain: ${domain}
Protocol: ${parsedUrl.protocol}
Path: ${path || '/'}
HTTPS: ${isHTTPS ? 'Yes' : 'No'}

Based on the URL structure and domain, provide a comprehensive website audit. Return a JSON object with this EXACT structure:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "category": "SEO|Performance|Content|Accessibility|Security",
      "description": "Detailed description",
      "priority": "High|Medium|Low",
      "impact": "Expected impact"
    }
  ],
  "findings": {
    "hasMetaDescription": true/false,
    "hasOpenGraphTags": true/false,
    "hasSchemaMarkup": true/false,
    "isHTTPS": ${isHTTPS},
    "domainAge": "New|Established|Mature",
    "mobileFriendly": true/false,
    "pageSpeed": "Fast|Moderate|Slow",
    "seoScore": 0-100,
    "performanceScore": 0-100,
    "accessibilityScore": 0-100
  },
  "scores": {
    "overall": 0-100,
    "seo": 0-100,
    "performance": 0-100,
    "accessibility": 0-100
  },
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ]
}

Provide 4-6 specific, actionable recommendations covering different categories.`
    }
  ];

  try {
    const response = await callDeepSeek(messages, { jsonMode: true, maxTokens: 3000 });
    const result = JSON.parse(response) as WebsiteAuditResult;
    
    // Validate and enhance results
    result.findings.isHTTPS = isHTTPS;
    result.findings.domainAge = result.findings.domainAge || 'Unknown';
    
    // Calculate scores based on actual findings
    let seoScore = 50;
    if (isHTTPS) seoScore += 15;
    if (domain.length < 20) seoScore += 10;
    if (!hasSubdomain || domain.split('.').length === 2) seoScore += 10;
    if (result.findings.hasMetaDescription) seoScore += 10;
    if (result.findings.hasOpenGraphTags) seoScore += 5;
    if (result.findings.hasSchemaMarkup) seoScore += 10;
    result.scores.seo = Math.min(100, Math.max(0, seoScore));
    
    let performanceScore = 60;
    if (isHTTPS) performanceScore += 20;
    if (result.findings.pageSpeed === 'Fast') performanceScore += 20;
    else if (result.findings.pageSpeed === 'Moderate') performanceScore += 10;
    result.scores.performance = Math.min(100, Math.max(0, performanceScore));
    
    result.scores.overall = Math.round(
      (result.scores.seo * 0.4 + result.scores.performance * 0.4 + result.scores.accessibility * 0.2)
    );
    
    return result;
  } catch (error: any) {
    console.error("Error generating website audit:", error);
    
    // Return fallback result
    const fallbackScore = isHTTPS ? 75 : 60;
    return {
      recommendations: [
        {
          title: isHTTPS ? 'Website uses HTTPS' : 'Implement HTTPS',
          category: 'Security',
          description: isHTTPS 
            ? 'Your website uses HTTPS, which is excellent for security and SEO.'
            : 'Your website should use HTTPS to ensure secure connections and improve SEO rankings.',
          priority: isHTTPS ? 'Low' : 'High',
          impact: isHTTPS 
            ? 'Maintains security and trust'
            : 'Improves security, SEO rankings, and user trust',
        },
        {
          title: 'Optimize URL Structure',
          category: 'SEO',
          description: `Your URL is: ${url}. Ensure URLs are clean, descriptive, and include relevant keywords.`,
          priority: 'Medium',
          impact: 'Better SEO rankings and user experience',
        },
        {
          title: 'Add Meta Descriptions',
          category: 'SEO',
          description: 'Ensure all pages have unique, compelling meta descriptions (150-160 characters).',
          priority: 'High',
          impact: 'Improved click-through rates from search results',
        },
      ],
      findings: {
        hasMetaDescription: false,
        hasOpenGraphTags: false,
        hasSchemaMarkup: false,
        isHTTPS,
        domainAge: 'Unknown',
        mobileFriendly: true,
        pageSpeed: 'Moderate',
        seoScore: fallbackScore,
        performanceScore: isHTTPS ? 80 : 65,
        accessibilityScore: 70,
      },
      scores: {
        overall: fallbackScore,
        seo: fallbackScore,
        performance: isHTTPS ? 80 : 65,
        accessibility: 70,
      },
      insights: [
        `Website domain: ${domain}`,
        isHTTPS ? 'Website uses secure HTTPS protocol' : 'Website should implement HTTPS',
        'Consider implementing structured data (Schema.org) for better search visibility',
      ],
    };
  }
};

export const generatePersonalizedLeadMessage = async (name: string, company: string, source: string): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are a sales expert specializing in personalized outreach. Generate short, friendly, and professional outreach emails.'
    },
    {
      role: 'user',
      content: `Generate a short, friendly, and professional outreach email to a new lead.
    
Lead's Name: ${name}
Lead's Company: ${company}
Lead Source: ${source}

Your goal is to start a conversation, not to hard-sell. Mention their company and how they were discovered (the source).
Keep it under 100 words.

Start with "Hi ${name}," and end with your name, "Alex from Aether".`
    }
  ];

  try {
    return await callDeepSeek(messages);
  } catch (error) {
    console.error("Error generating lead message with DeepSeek API:", error);
    return "Error: Could not generate a personalized message.";
  }
};

export const generateBusinessInsights = async (userData: {
  businessName?: string;
  industry?: string;
  goals?: string[];
  tasks?: any[];
  projects?: any[];
  leads?: any[];
  kpis?: any[];
  monthlySales?: any[];
}): Promise<Array<{ type: 'recommendation' | 'alert' | 'tip'; title: string; content: string }>> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are an AI business analyst for Aether. Analyze business data and provide actionable insights. Return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Analyze the following business data and provide 3 actionable insights (one recommendation, one alert, one productivity tip).

Business Name: ${userData.businessName || 'Not specified'}
Industry: ${userData.industry || 'Not specified'}
Goals: ${userData.goals?.join(', ') || 'Not specified'}

Tasks: ${userData.tasks?.length || 0} total tasks
- Completed: ${userData.tasks?.filter((t: any) => t.status === 'done').length || 0}
- In Progress: ${userData.tasks?.filter((t: any) => t.status === 'inprogress').length || 0}
- To Do: ${userData.tasks?.filter((t: any) => t.status === 'todo').length || 0}

Projects: ${userData.projects?.length || 0} projects
Leads: ${userData.leads?.length || 0} leads
KPIs: ${userData.kpis?.length || 0} tracked metrics
Sales Data: ${userData.monthlySales?.length || 0} months of data

Return a JSON array with exactly 3 insights:
[
  { "type": "recommendation", "title": "Title", "content": "Actionable recommendation based on data" },
  { "type": "alert", "title": "Title", "content": "Important alert or warning" },
  { "type": "tip", "title": "Title", "content": "Productivity tip" }
]

Make insights specific, actionable, and based on the actual data provided.`
    }
  ];

  try {
    const response = await callDeepSeek(messages, { jsonMode: true });
    return JSON.parse(response);
  } catch (error: any) {
    console.error("Error generating business insights:", error);
    return [
      {
        type: 'recommendation',
        title: 'Get Started',
        content: 'Upload your business data to receive personalized AI insights and recommendations.',
      },
      {
        type: 'alert',
        title: 'Setup Required',
        content: 'Complete your business profile to unlock all features.',
      },
      {
        type: 'tip',
        title: 'Productivity',
        content: 'Create tasks and projects to track your business progress.',
      },
    ];
  }
};

// New function for copilot chat
export const generateCopilotResponse = async (
  userMessage: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: `You are Byte&Berry Copilot, an AI assistant inside the Aether workspace. You help users analyze their business data, surface insights, and plan next steps.

Workspace context:
${context}

Answer in a friendly, concise tone. Use bullet points when helpful and surface specific data-driven insights.`
    }
  ];

  // Add conversation history
  conversationHistory.slice(-6).forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    return await callDeepSeek(messages, { temperature: 0.8 });
  } catch (error: any) {
    console.error("Error generating copilot response:", error);
    throw error;
  }
};

