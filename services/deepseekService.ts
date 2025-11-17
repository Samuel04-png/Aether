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
      content: 'You are a helpful business partner who breaks down news and articles into what really matters. Talk like a friend would - clear, direct, and practical. No jargon unless it\'s actually useful.'
    },
    {
      role: 'user',
      content: `Hey, can you help me understand this article? Break it down for me - what are the main points, how might this affect my business, and what should I actually do about it? Keep it simple and use bullet points. Here\'s the article: "${textToSummarize}"`
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
      content: 'You\'re a social media whiz who gets how to make content that actually connects with people. You know what works on each platform and how to write in a way that feels authentic, not salesy.'
    },
    {
      role: 'user',
      content: `I need a ${platform} post about ${topic}, and I want it to sound ${tone}. Make it engaging and authentic - the kind of thing people would actually want to read and share. Add some relevant hashtags that make sense (not too many!).`
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
      content: 'You\'re a web expert who knows SEO, performance, and accessibility inside out. You explain things in plain English and focus on what actually matters. Return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Give this website a quick audit: ${url}

What we know:
- Domain: ${domain}
- Protocol: ${parsedUrl.protocol}
- Path: ${path || '/'}
- HTTPS: ${isHTTPS ? 'Yes' : 'No'}

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
      content: 'You\'re great at writing outreach messages that feel personal and genuine, not like spam. You know how to start conversations, not pitch products.'
    },
    {
      role: 'user',
      content: `Help me write a friendly message to reach out to this person:
    
Who: ${name} at ${company}
How we found them: ${source}

Keep it conversational and authentic - like you\'re genuinely interested in connecting, not selling. Mention their company naturally and reference where you found them. Keep it short (under 100 words).

Start with "Hi ${name}," and end with "Alex from Aether" (that\'s me!).`
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
      content: 'You\'re a business coach who\'s really good at spotting patterns and opportunities in the data. You give advice that\'s practical and specific to what you see, not generic platitudes. Return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Take a look at this business and tell me what you see - give me one solid recommendation for growth, one heads-up about something that needs attention, and one practical tip to work smarter.

Here's what we're working with:
Business: ${userData.businessName || 'Getting started'}
Industry: ${userData.industry || 'Not specified yet'}
Goals: ${userData.goals?.join(', ') || 'Setting up'}

Task status:
- Total: ${userData.tasks?.length || 0}
- Done: ${userData.tasks?.filter((t: any) => t.status === 'done').length || 0}
- In progress: ${userData.tasks?.filter((t: any) => t.status === 'inprogress').length || 0}
- To do: ${userData.tasks?.filter((t: any) => t.status === 'todo').length || 0}

Other numbers:
- ${userData.projects?.length || 0} projects going
- ${userData.leads?.length || 0} leads in the pipeline
- ${userData.kpis?.length || 0} metrics being tracked
- ${userData.monthlySales?.length || 0} months of sales data

Give me a JSON array with exactly 3 insights that are specific to THIS data:
[
  { "type": "recommendation", "title": "Short title", "content": "Specific, actionable advice based on what you see" },
  { "type": "alert", "title": "Short title", "content": "Something important that needs attention now" },
  { "type": "tip", "title": "Short title", "content": "A practical way to work more efficiently" }
]

Make it feel personal and relevant - not generic advice that could apply to anyone.`
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
      content: `Hey! You're the Byte&Berry Copilot - think of yourself as a savvy business partner who's always got your back. You're here to help make sense of all the data, spot opportunities, and figure out what to do next.

Here's what's happening in the workspace:
${context}

Talk like you're chatting with a friend over coffee - warm, genuine, and straight to the point. Skip the corporate speak. When you share insights, make them actionable and based on what you actually see in their data. Use bullet points when it makes things clearer, but don't overdo it. If you spot something important, call it out directly. If something's confusing or you need more info, just ask.`
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

