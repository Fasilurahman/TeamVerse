import axios from 'axios';

export class GeminiService {
    private apiKey: string;
    
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY!;
        if (!this.apiKey) {
            console.error("GEMINI_API_KEY environment variable is not set");
        }
    }
    
    async generateSummary(prompt: string): Promise<string> {
        try {

            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
                {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        key: this.apiKey,
                    }
                }
            );


            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                
                const candidate = response.data.candidates[0];
                if (candidate.content) {
                    
                    if (candidate.content.parts && candidate.content.parts.length > 0) {
                        
                        const summaryText = candidate.content.parts[0].text;
                        
                        return summaryText || "No summary text in response.";
                    }
                }
            }
            
            console.warn("Unexpected response structure from Gemini API:", JSON.stringify(response.data));
            return "No summary generated. Unexpected API response format.";
        } catch (error: any) {

            if (error.response) {
                console.error("Gemini API error response:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
                
                if (error.response.status === 403) {
                    throw new Error("Authentication failed with Gemini API. Please check your API key.");
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Gemini API no response:", error.request);
                throw new Error("No response received from Gemini API.");
            } else {
                // Something happened in setting up the request
                console.error("Gemini API request setup error:", error.message);
            }
            
            throw new Error(`Failed to generate summary using Gemini: ${error.message}`);
        }
    }
}