interface OpenRouterOptions {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface OpenRouterResponse {
  content: string;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    confidence: number;
  };
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY_ENV_VAR || "default_key";
  }

  async generateResponse(prompt: string, options: OpenRouterOptions = {}): Promise<OpenRouterResponse> {
    const startTime = Date.now();

    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: "user", 
        content: prompt,
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(',')[0] || "https://lexai.app",
          "X-Title": "LexAI - AI Legal Assistant",
        },
        body: JSON.stringify({
          model: options.model || "mistralai/mistral-small-24b-instruct-2501:free",
          messages,
          max_tokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.3,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const tokensUsed = data.usage?.total_tokens || 0;

      return {
        content,
        metadata: {
          model: data.model || options.model || "mistral-small",
          tokensUsed,
          processingTime: Date.now() - startTime,
          confidence: 0.7, // Lower confidence for free model
        },
      };

    } catch (error) {
      console.error("OpenRouter service error:", error);
      throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateStructuredResponse(prompt: string, schema: any, options: OpenRouterOptions = {}): Promise<any> {
    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt + "\n\nPlease respond in valid JSON format according to the provided schema.",
        });
      }

      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(',')[0] || "https://lexai.app",
          "X-Title": "LexAI - AI Legal Assistant",
        },
        body: JSON.stringify({
          model: options.model || "mistralai/mistral-small-24b-instruct-2501:free",
          messages,
          max_tokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", content);
        throw new Error("Invalid JSON response from OpenRouter");
      }

    } catch (error) {
      console.error("OpenRouter structured response error:", error);
      throw new Error(`OpenRouter structured response error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("OpenRouter availability check failed:", error);
      return false;
    }
  }

  async getModelInfo(modelId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch model info: ${response.status}`);
      }

      const data = await response.json();
      const models = data.data || [];
      
      return models.find((model: any) => model.id === modelId);
    } catch (error) {
      console.error("Failed to get model info:", error);
      return null;
    }
  }
}

export const openrouterService = new OpenRouterService();
