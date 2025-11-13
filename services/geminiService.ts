import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey ?? "" });

export const summarizeText = async (textToSummarize: string): Promise<string> => {
  const prompt = `You are an expert business analyst. Summarize the following news article for a small business owner. Focus on the key takeaways, potential impact, and actionable insights. Keep it concise and clear, using bullet points for the main takeaways. Article: "${textToSummarize}"`;

  try {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Error summarizing text with Gemini API:", error);
    const statusCode = error?.status || error?.code || '';
    if (statusCode === 429 || error?.message?.includes('429')) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    } else if (statusCode === 503 || error?.message?.includes('503')) {
      throw new Error("Service temporarily unavailable. Please try again later.");
    }
    throw new Error("Could not summarize the article. Please try again later.");
  }
};

export const createTasksFromPrompt = async (prompt: string): Promise<any> => {
  const generationPrompt = `Analyze the following text and extract actionable tasks. Identify a title, a detailed description, and a due date if mentioned. Text: "${prompt}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              dueDate: { type: Type.STRING, description: "YYYY-MM-DD format, or null" }
            },
          },
        },
      },
    });
    
    // The response text should be a JSON string, so we parse it.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error creating tasks with Gemini API:", error);
    return { error: "Could not generate tasks. Please try again." };
  }
};

export const generateSocialPost = async (topic: string, platform: string, tone: string): Promise<string> => {
    const prompt = `You are a professional social media manager. Write a social media post for a small business.
    Platform: ${platform}
    Topic: ${topic}
    Tone: ${tone}
    
    Keep the post concise, engaging, and relevant for the specified platform. Include relevant hashtags.`;

    try {
        if (!apiKey) {
            throw new Error("Gemini API key not configured");
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating social post with Gemini API:", error);
        const statusCode = error?.status || error?.code || '';
        if (statusCode === 429 || error?.message?.includes('429')) {
            throw new Error("Rate limit exceeded. Please try again in a moment.");
        } else if (statusCode === 503 || error?.message?.includes('503')) {
            throw new Error("Service temporarily unavailable. Please try again later.");
        }
        throw new Error("Could not generate the post. Please try again.");
    }
};

export const generateEnhancedImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data returned from API.");

    } catch (error) {
        console.error("Error generating enhanced image with Gemini API:", error);
        throw error;
    }
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
    // Validate and parse URL
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

    const prompt = `You are an expert SEO, web performance, and accessibility analyst. Analyze the website: ${url}

Domain: ${domain}
Protocol: ${parsedUrl.protocol}
Path: ${path || '/'}
HTTPS: ${isHTTPS ? 'Yes' : 'No'}

Based on the URL structure and domain, provide a comprehensive website audit. Analyze:

1. **SEO Analysis:**
   - Check if the domain suggests good SEO practices (short, memorable, keyword-rich if applicable)
   - Assess URL structure (clean paths, descriptive slugs)
   - Evaluate HTTPS usage
   - Check for common SEO issues based on domain patterns

2. **Performance Indicators:**
   - Domain structure suggests potential performance optimizations
   - URL patterns indicate routing efficiency
   - HTTPS ensures secure, fast connections

3. **Content & Structure:**
   - URL path suggests content organization
   - Domain name indicates brand clarity
   - Subdomain usage (if any) shows technical architecture

4. **Accessibility:**
   - URL structure suggests semantic organization
   - Domain clarity aids user navigation

5. **Security:**
   - HTTPS implementation
   - Domain security practices

Provide your analysis in the following JSON format:
{
    "recommendations": [
        {
            "title": "Specific recommendation title",
            "category": "SEO|Performance|Content|Accessibility|Security",
            "description": "Detailed description of the issue and why it matters",
            "priority": "High|Medium|Low",
            "impact": "Expected impact of implementing this recommendation"
        }
    ],
    "findings": {
        "hasMetaDescription": true/false (assess based on URL/domain quality),
        "hasOpenGraphTags": true/false (assess likelihood),
        "hasSchemaMarkup": true/false (assess likelihood),
        "isHTTPS": ${isHTTPS},
        "domainAge": "Estimate: New|Established|Mature (based on domain patterns)",
        "mobileFriendly": true/false (assess based on modern domain practices),
        "pageSpeed": "Fast|Moderate|Slow (estimate based on domain structure)",
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
        "Key insight 1 about the website",
        "Key insight 2 about optimization opportunities",
        "Key insight 3 about user experience"
    ]
}

Be specific and actionable. Base scores on URL structure, domain quality, HTTPS usage, and common web best practices. Provide 4-6 recommendations covering different categories.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        const result = JSON.parse(response.text) as WebsiteAuditResult;
        
        // Validate and enhance results with actual URL data
        result.findings.isHTTPS = isHTTPS;
        result.findings.domainAge = result.findings.domainAge || 'Unknown';
        
        // Calculate scores based on actual findings
        let seoScore = 50; // Base score
        if (isHTTPS) seoScore += 15;
        if (domain.length < 20) seoScore += 10; // Shorter domains are better
        if (!hasSubdomain || domain.split('.').length === 2) seoScore += 10; // Clean domain
        if (result.findings.hasMetaDescription) seoScore += 10;
        if (result.findings.hasOpenGraphTags) seoScore += 5;
        if (result.findings.hasSchemaMarkup) seoScore += 10;
        result.scores.seo = Math.min(100, Math.max(0, seoScore));
        
        let performanceScore = 60; // Base score
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
        
        // Return fallback result with URL-based analysis
        const fallbackScore = isHTTPS ? 75 : 60;
        return {
            recommendations: [
                {
                    title: isHTTPS ? 'Implement HTTPS' : 'Website uses HTTPS',
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
                    description: 'Ensure all pages have unique, compelling meta descriptions (150-160 characters) that accurately describe the page content.',
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
                isHTTPS ? 'Website uses secure HTTPS protocol' : 'Website should implement HTTPS for security',
                'Consider implementing structured data (Schema.org) for better search visibility',
            ],
        };
    }
};

export const generatePersonalizedLeadMessage = async (name: string, company: string, source: string): Promise<string> => {
    const prompt = `You are a sales expert specializing in personalized outreach.
    Generate a short, friendly, and professional outreach email to a new lead.
    
    Lead's Name: ${name}
    Lead's Company: ${company}
    Lead Source: ${source}
    
    Your goal is to start a conversation, not to hard-sell. Mention their company and how they were discovered (the source).
    Keep it under 100 words.
    
    Start with "Hi ${name}," and end with your name, "Alex from Aether".`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating lead message with Gemini API:", error);
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
    const prompt = `You are an AI business analyst for Aether. Analyze the following business data and provide 3 actionable insights (one recommendation, one alert, one productivity tip).

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

Provide 3 insights in JSON format:
[
  { "type": "recommendation", "title": "Title", "content": "Actionable recommendation based on data" },
  { "type": "alert", "title": "Title", "content": "Important alert or warning" },
  { "type": "tip", "title": "Title", "content": "Productivity tip" }
]

Make insights specific, actionable, and based on the actual data provided.`;

    try {
        if (!apiKey) {
            throw new Error("Gemini API key not configured");
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['recommendation', 'alert', 'tip'] },
                            title: { type: Type.STRING },
                            content: { type: Type.STRING },
                        },
                    },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error: any) {
        console.error("Error generating business insights:", error);
        // Return default insights if AI fails
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