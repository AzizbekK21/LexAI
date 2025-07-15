import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import session from "express-session";
import { aiService } from "./services/aiService";
import { getLexAIResponse } from "./services/aiService";
import { z } from "zod";
import { authenticateUser, registerUser } from "./auth";
import passport from "passport";
import { searchLaws } from "./services/lawSearchService";
import cookie from 'cookie';
import { promisify } from 'util';
import { getLawByCountryAndArticle } from "./services/lawService";
import './passport';
import connectPg from "connect-pg-simple";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

function generateTitleFromContent(content: string): string {
  const firstSentence = content.split(/[.?!]/)[0];
  return firstSentence.length > 50
    ? firstSentence.slice(0, 47).trim() + "..."
    : firstSentence.trim() || "Legal Consultation";
}

function determineCategoryFromContent(content: string): "general" | "contract" | "employment" | "criminal" | "business" {
  const lower = content.toLowerCase();
  if (lower.includes("contract") || lower.includes("agreement")) return "contract";
  if (lower.includes("employee") || lower.includes("salary") || lower.includes("termination")) return "employment";
  if (lower.includes("crime") || lower.includes("police") || lower.includes("prosecutor")) return "criminal";
  if (lower.includes("startup") || lower.includes("incorporate") || lower.includes("founder")) return "business";
  return "general";
}

const chatMessageSchema = z.object({
  message: z.string().max(4000).optional(),
  conversationId: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const usageIncrementSchema = z.object({
  count: z.number().int().positive().default(1),
});

let sessionStore: session.Store;

function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-here',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));
}

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

function getUserIdFromSession(req: any): Promise<string | null> {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sid = cookies['connect.sid'];

  if (!sid) return Promise.resolve(null);

  return new Promise((resolve) => {
    sessionStore.get(sid, (err, session) => {
      if (err || !session?.userId) return resolve(null);
      resolve(session.userId);
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await registerUser(email, password, firstName, lastName);
      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/auth',
      session: true,
    }),
    (req, res) => {
      if (req.user) {
        req.session.userId = (req.user as any).id;
      }
      res.redirect('/'); // Или куда хочешь, например: /dashboard
    }
  );

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Usage tracking endpoints
  app.get("/api/usage", async (req, res) => {
    try {
      // Mock user ID for now - replace with actual authentication
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const usage = await storage.getUserUsage(userId);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage data" });
    }
  });

  app.get("/api/law/:country/:article", async (req, res) => {
    const { country, article } = req.params;

    const law = await getLawByCountryAndArticle(country, article);
    if (!law) return res.status(404).json({ message: "Law not found" });

    res.json(law);
  });

  app.post("/api/usage/increment", async (req, res) => {
    try {
      const { count } = usageIncrementSchema.parse(req.body);
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const usage = await storage.incrementUsage(userId, count);
      res.json(usage);
    } catch (error) {
      console.error("Error incrementing usage:", error);
      res.status(500).json({ message: "Failed to increment usage" });
    }
  });

  app.post("/api/ai", async (req, res) => {
    const { prompt } = req.body;
    const result = await getLexAIResponse(prompt);
    res.json({ result });
  });

  app.post("/api/law/search", async (req, res) => {
    const { country, query } = req.body;

    if (!country || !query) {
      return res.status(400).json({ message: "country и query обязательны" });
    }

    try {
      const results = await searchLaws(country, query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при поиске закона", error: error.message });
    }
  });

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId, attachments } = chatMessageSchema.parse(req.body);
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });


      // Check usage limits
      const usage = await storage.getUserUsage(userId);
      if (usage.current >= usage.limit) {
        return res.status(429).json({ 
          message: "Usage limit exceeded",
          usage: usage
        });
      }

      // Get or create conversation
      let conversation;
      if (conversationId && conversationId.trim() !== "") {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        conversation = await storage.createConversation({
          userId,
          title: message?.substring(0, 50) || "New Conversation",
          category: "general",
        });
      }

      if (!message || message.trim() === "") {
        return res.json({ conversation });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        attachments: attachments || [],
      });

      // Get AI response
      const aiResponse = await aiService.generateResponse(message, {
        conversationId: conversation.id,
        userId,
        planType: usage.planType as "free" | "premium",
        attachments: attachments || [],
      });

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant", 
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      });

      // If it's the first message (i.e., only 1 user + 1 assistant), generate title + category
      const allMessages = await storage.getConversationMessages(conversation.id);
      if (allMessages.length === 2) {
        const firstAiReply = aiResponse.content;

        const generatedTitle = firstAiReply.slice(0, 60).replace(/\s+/g, " ").trim();
        const lower = firstAiReply.toLowerCase();

        let detectedCategory: "general" | "contract" | "employment" | "criminal" | "business" = "general";
        if (lower.includes("contract") || lower.includes("agreement")) detectedCategory = "contract";
        else if (lower.includes("employment") || lower.includes("job") || lower.includes("hire")) detectedCategory = "employment";
        else if (lower.includes("crime") || lower.includes("police") || lower.includes("arrest") || lower.includes("criminal")) detectedCategory = "criminal";
        else if (lower.includes("business") || lower.includes("startup") || lower.includes("company")) detectedCategory = "business";

        await storage.updateConversationMetadata(conversation.id, {
          title: generatedTitle,
          category: detectedCategory,
        });

        // Also update it in memory
        conversation.title = generatedTitle;
        conversation.category = detectedCategory;
      }

      // Автоматическое обновление title и category
      if (conversation.title === "New conversation") {
        const newTitle = generateTitleFromContent(aiResponse.content);
        const newCategory = determineCategoryFromContent(aiResponse.content);

        await storage.updateConversation(conversation.id, {
          title: newTitle,
          category: newCategory,
        });

        // Обновим в памяти, чтобы вернуть в ответ
        conversation.title = newTitle;
        conversation.category = newCategory;
      }

      // Increment usage
      await storage.incrementUsage(userId, 1);

      res.json({
        conversation,
        userMessage,
        aiMessage,
        usage: await storage.getUserUsage(userId),
      });

    } catch (error) {
      console.error("Error in chat endpoint:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const conversations = await storage.getUserConversationsWithMessageCount(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { title = "New conversation", category = "general" } = req.body;

      const conversation = await storage.createConversation({
        userId,
        title,
        category,
      });

      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const convo = await storage.getConversation(id);
    if (!convo || convo.userId !== userId) return res.status(404).json({ message: "Not found" });

    const messages = await storage.getConversationMessages(id);
    await storage.deleteConversationFully(id);
    res.json({ deleted: true });
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Document analysis endpoints
  app.post("/api/documents/analyze", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // Check usage limits
      const usage = await storage.getUserUsage(userId);
      if (usage.current >= usage.limit) {
        return res.status(429).json({ 
          message: "Usage limit exceeded",
          usage: usage
        });
      }

      // Mock document analysis for now
      const analysisId = Date.now().toString();
      
      // Simulate analysis process
      setTimeout(async () => {
        try {
          await storage.createDocumentAnalysis({
            id: analysisId,
            userId,
            fileName: "document.pdf",
            status: "completed",
            summary: "Document analysis completed successfully.",
            riskLevel: "low",
            keyPoints: ["Standard terms", "No red flags detected"],
            recommendations: ["Review section 3.2", "Consider adding termination clause"],
          });
        } catch (error) {
          console.error("Error saving document analysis:", error);
        }
      }, 3000);

      res.json({
        analysisId,
        status: "processing",
        message: "Document analysis started"
      });

    } catch (error) {
      console.error("Error starting document analysis:", error);
      res.status(500).json({ message: "Failed to start document analysis" });
    }
  });

  app.get("/api/documents/analyses", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const analyses = await storage.getUserDocumentAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching document analyses:", error);
      res.status(500).json({ message: "Failed to fetch document analyses" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time features
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  const activeConnections = new Map<string, WebSocket>();

  wss.on('connection', async (ws, req) => {
    const userId = await getUserIdFromSession(req);

    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }
    
    // Generate connection ID
    const connectionId = Date.now().toString();
    activeConnections.set(connectionId, ws);

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'send_message':
            // Handle real-time chat message
            const { conversationId, content } = message.data;
            
            // Broadcast typing indicator to other clients
            broadcastToConversation(conversationId, {
              type: 'typing_start',
              data: { userId }
            }, connectionId);

            // Get AI response
            const aiResponse = await aiService.generateResponse(content, {
              conversationId,
              userId,
              planType: 'free',
            });

            // Stop typing indicator
            broadcastToConversation(conversationId, {
              type: 'typing_stop', 
              data: { userId }
            }, connectionId);

            // Send AI response
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'new_message',
                data: {
                  id: Date.now().toString(),
                  conversationId,
                  role: 'assistant',
                  content: aiResponse.content,
                  timestamp: new Date().toISOString(),
                }
              }));
            }
            break;

          case 'typing_start':
          case 'typing_stop':
            // Broadcast typing indicators
            broadcastToConversation(message.data.conversationId, message, connectionId);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      activeConnections.delete(connectionId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcastToConversation(conversationId: string, message: any, excludeConnectionId?: string) {
    activeConnections.forEach((connection, connectionId) => {
      if (connectionId !== excludeConnectionId && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
