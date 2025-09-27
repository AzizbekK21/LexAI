import OpenAI from "openai";

interface OpenAIOptions {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  content: string;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    confidence: number;
  };
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt: string, options: OpenAIOptions = {}): Promise<OpenAIResponse> {
    const startTime = Date.now();

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
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

      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.2,
        response_format: { type: "text" },
      });

      const content = response.choices[0]?.message?.content || "";
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        metadata: {
          model: response.model,
          tokensUsed,
          processingTime: Date.now() - startTime,
          confidence: 0.9, // High confidence for GPT-4o
        },
      };

    } catch (error) {
      console.error("OpenAI service error:", error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async analyzeDocument(base64Content: string, documentType: string, options: OpenAIOptions = {}): Promise<OpenAIResponse> {
    const startTime = Date.now();

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze this ${documentType} document and provide a comprehensive legal review including key terms, potential risks, and recommendations.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Content}`,
            },
          },
        ],
      });

      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // Vision capabilities
        messages,
        max_tokens: options.maxTokens || 3000,
        temperature: options.temperature || 0.1, // Lower temperature for document analysis
      });

      const content = response.choices[0]?.message?.content || "";
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        metadata: {
          model: response.model,
          tokensUsed,
          processingTime: Date.now() - startTime,
          confidence: 0.95, // Very high confidence for document analysis
        },
      };

    } catch (error) {
      console.error("OpenAI document analysis error:", error);
      throw new Error(`OpenAI document analysis error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateStructuredResponse(prompt: string, schema: any, options: OpenAIOptions = {}): Promise<any> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
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

      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4o",
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);

    } catch (error) {
      console.error("OpenAI structured response error:", error);
      throw new Error(`OpenAI structured response error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async transcribeAudio(audioBuffer: Buffer, options: { language?: string } = {}): Promise<string> {
    try {
      // Преобразуем Buffer в ReadStream
      const { Readable } = require('stream');
      const audioStream = new Readable();
      audioStream.push(audioBuffer);
      audioStream.push(null);

      const response = await this.client.audio.transcriptions.create({
        file: audioStream as any, // Временное решение для типизации
        model: "whisper-1",
        language: options.language || "en",
        response_format: "text",
      });

      return response;

    } catch (error) {
      console.error("OpenAI transcription error:", error);
      throw new Error(`OpenAI transcription error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const openaiService = new OpenAIService();
