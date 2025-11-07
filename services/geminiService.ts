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


export const generateWebsiteAudit = async (url: string): Promise<string> => {
    const prompt = `You are an expert SEO and web performance analyst. You are auditing the website: ${url}. 
    Provide 2-3 actionable recommendations to improve this website's SEO, performance, and user engagement. 
    Format your response as a series of distinct recommendations, each with a clear title (e.g., 'SEO Opportunity' or 'Content Improvement'), a brief explanation, and a concrete suggestion.
    For example:
    **SEO Opportunity:** Your homepage is missing a meta description...
    **Content Improvement:** The "About Us" page could be more engaging...
    Keep the analysis high-level and focus on common issues.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating website audit with Gemini API:", error);
        return "Error: Could not generate audit recommendations. Please try again.";
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