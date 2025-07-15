import { openaiService } from "./openaiService";
import { openrouterService } from "./openrouterService";
import { LEGAL_PROMPTS } from "@/lib/constants";
import { openai } from "../lib/openai";
import { searchLaws } from "./lawSearchService";

interface AIRequestOptions {
  conversationId?: string;
  userId: string;
  planType: "free" | "premium";
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  context?: string;
}

interface AIResponse {
  content: string;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    confidence: number;
  };
}

export async function getLexAIResponse(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Ты — юридический AI LexAI. Помогаешь пользователю, используя реальные законы.",
      },
      {
        role: "user",
        content: prompt,
      }
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
}

class AIService {
  async generateResponse(message: string, options: AIRequestOptions): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Choose AI service based on plan type
      const useOpenAI = options.planType === "premium";
      const lawMatches = await searchLaws("TJ", message);
      
      // Prepare the prompt with legal context
      let systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(message, options);

      try {
        const lawMatches = await searchLaws("TJ", message); // TODO: заменить "TJ" на выбранную страну

        if (lawMatches.length > 0) {
          systemPrompt += "\n\nВот найденные законы из официальных источников:\n\n" +
            lawMatches.map(l => `• **Статья ${l.article}**: ${l.text}\n(Источник: ${l.source})`).join("\n\n");
        }
      } catch (err) {
        console.warn("Не удалось получить статьи закона:", err);
      }

      let response: AIResponse;

      if (useOpenAI) {
        try {
          response = await openaiService.generateResponse(userPrompt, {
            systemPrompt,
            model: "gpt-4o",
            maxTokens: 2048,
            temperature: 0.2,
          });
        } catch (error: any) {
          // Если ошибка от OpenAI — fallback на OpenRouter
          console.error("⚠️ OpenAI failed. Falling back to Mistral:", error.message);

          if (error.message.includes("429") || error.message.includes("quota")) {
            response = await openrouterService.generateResponse(userPrompt, {
              systemPrompt,
              model: "mistralai/mistral-small-24b-instruct-2501:free",
              maxTokens: 1024,
              temperature: 0.3,
            });
          } else {
            throw error; // другие ошибки пробрасываем
          }
        }
      } else {
        response = await openrouterService.generateResponse(userPrompt, {
          systemPrompt,
          model: "mistralai/mistral-small-24b-instruct-2501:free",
          maxTokens: 1024,
          temperature: 0.3,
        });
      }

      // Add processing metadata
      response.metadata.processingTime = Date.now() - startTime;
      response.metadata.confidence = this.calculateConfidence(response.content, options.planType);

      // Post-process the response for legal accuracy
      response.content = this.postProcessLegalResponse(response.content);

      return response;

    } catch (error) {
      console.error("AI service error:", error);
      
      // Return fallback response
      return {
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.",
        metadata: {
          model: "fallback",
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          confidence: 0,
        },
      };
    }
  }

  private buildSystemPrompt(options: AIRequestOptions): string {
    let prompt = LEGAL_PROMPTS.system;
    if ((global as any).__lawMatches && Array.isArray((global as any).__lawMatches)) {
      const laws = (global as any).__lawMatches as {
        article: string;
        text: string;
        source: string;
      }[];

      if (laws.length > 0) {
        prompt += `\n\nThe following official laws were found based on the user's message:\n\n`;
        for (const law of laws) {
          prompt += `• **Article ${law.article}** — ${law.text}\n(Source: ${law.source})\n\n`;
        }
      }
    }

    // Add plan-specific instructions
    if (options.planType === "premium") {
      prompt += "\n\nYou are operating in PREMIUM mode with access to advanced legal analysis capabilities. Provide comprehensive, detailed responses with citations and precedent references where applicable.";
    } else {
      prompt += "\n\nYou are operating in FREE mode. Provide helpful but concise responses. For complex legal matters, recommend upgrading to Premium for detailed analysis.";
    }

    // Add document analysis context if attachments are present
    if (options.attachments && options.attachments.length > 0) {
      prompt += "\n\nThe user has attached documents for analysis. Incorporate document-specific insights into your response.";
    }

    return prompt;
  }

  private buildUserPrompt(message: string, options: AIRequestOptions): string {
    let prompt = message;

    // Add context if available
    if (options.context) {
      prompt = `Context from previous conversation:\n${options.context}\n\nCurrent question: ${message}`;
    }

    // Add attachment information
    if (options.attachments && options.attachments.length > 0) {
      const attachmentInfo = options.attachments
        .map(a => `- ${a.name} (${a.type}, ${this.formatFileSize(a.size)})`)
        .join("\n");
      
      prompt += `\n\nAttached documents:\n${attachmentInfo}`;
    }

    return prompt;
  }

  private postProcessLegalResponse(content: string): string {
    // Add legal disclaimers if not present
    if (!content.toLowerCase().includes("not legal advice") && 
        !content.toLowerCase().includes("consult") &&
        !content.toLowerCase().includes("attorney")) {
      
      content += "\n\n**Disclaimer**: This information is for educational purposes and does not constitute legal advice. For specific legal matters, please consult with a qualified attorney.";
    }

    // Format legal citations and references
    content = this.formatLegalCitations(content);

    return content;
  }

  private formatLegalCitations(content: string): string {
    // Basic formatting for legal references
    content = content.replace(/\b(Article \d+)/g, "**$1**");
    content = content.replace(/\b(Section \d+(?:\.\d+)*)/g, "**$1**");
    content = content.replace(/\b(USC \d+)/g, "**$1**");
    content = content.replace(/\b(CFR \d+)/g, "**$1**");

    return content;
  }

  private calculateConfidence(content: string, planType: string): number {
    // Simple confidence scoring based on response characteristics
    let confidence = 0.7; // Base confidence

    // Higher confidence for premium responses
    if (planType === "premium") {
      confidence += 0.2;
    }

    // Increase confidence for longer, more detailed responses
    if (content.length > 500) {
      confidence += 0.1;
    }

    // Decrease confidence if response seems uncertain
    if (content.toLowerCase().includes("may") || 
        content.toLowerCase().includes("might") ||
        content.toLowerCase().includes("possibly")) {
      confidence -= 0.1;
    }

    // Increase confidence for responses with legal structure
    if (content.includes("**") || content.includes("1.") || content.includes("•")) {
      confidence += 0.1;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async analyzeDocument(documentContent: string, options: AIRequestOptions): Promise<AIResponse> {
    const prompt = LEGAL_PROMPTS.contractAnalysis + "\n\nDocument content:\n" + documentContent;
    
    return await this.generateResponse(prompt, {
      ...options,
      context: "Document analysis request",
    });
  }

  async assessRisk(situation: string, options: AIRequestOptions): Promise<AIResponse> {
    const prompt = LEGAL_PROMPTS.riskAssessment + "\n\nSituation:\n" + situation;
    
    return await this.generateResponse(prompt, {
      ...options,
      context: "Risk assessment request", 
    });
  }
}

export const aiService = new AIService();
