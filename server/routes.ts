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
import cookie from "cookie";
import crypto from "crypto";
import signature from "cookie-signature";
import { promisify } from 'util';
import { getLawByCountryAndArticle } from "./services/lawService";
import './passport';
import connectPg from "connect-pg-simple";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const chatMessageSchema = z.object({
  message: z.string().max(4000).optional(),
  conversationId: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
}).refine(data => (data.message && data.message.trim()) || (data.attachments && data.attachments.length > 0), {
  message: "Message or attachments required"
});

const usageIncrementSchema = z.object({
  count: z.number().int().positive().default(1),
});

let sessionStore: session.Store;

function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");

  sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(
    session({
      name: "sid",
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    })
  ); 
}

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

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
      res.redirect('/');
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
      const err = error as Error;
      res.status(500).json({ message: "Ошибка при поиске закона", error: err.message });
    }
  });

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

      // Автоматическое обновление title и category после первой AI-реплики
      if (conversation.title.toLowerCase().startsWith("new conversation")) {
          const titlePrompt = `Create a short, snappy, and descriptive headline for this text. Maximum 25 characters: "${aiResponse.content}"`;
          const categoryPrompt = `Define a category for this text. Possible options: general, contract, employment, criminal, business. Text: "${aiResponse.content}"`;

          // Генерация title через ИИ
          let generatedTitle = (await aiService.generateResponse(titlePrompt, { 
              conversationId: conversation.id, 
              userId, 
              planType: usage.planType as "free" | "premium" 
          })).content.trim();

          // Контроль длины на всякий случай
          if (generatedTitle.length > 25) {
              generatedTitle = generatedTitle.slice(0, 25).trim();
          }

          // Генерация категории через ИИ
          let detectedCategory = (await aiService.generateResponse(categoryPrompt, { 
              conversationId: conversation.id, 
              userId, 
              planType: usage.planType as "free" | "premium" 
          })).content.toLowerCase().trim() as "general" | "contract" | "employment" | "criminal" | "business";

          // Проверка на корректность категории
          const validCategories = ["general", "contract", "employment", "criminal", "business"];
          if (!validCategories.includes(detectedCategory)) detectedCategory = "general";

          // Сохранение в БД
          await storage.updateConversation(conversation.id, {
              title: generatedTitle,
              category: detectedCategory,
          });

          // Обновление в памяти для ответа
          conversation.title = generatedTitle;
          conversation.category = detectedCategory;
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
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const convo = await storage.getConversation(id);
      if (!convo || convo.userId !== userId) {
        return res.status(404).json({ message: "Not found" });
      }

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

  type ConnectionInfo = { ws: WebSocket; userId: string; rooms: Set<string> };
  const connections = new Map<string, ConnectionInfo>();
  const rooms = new Map<string, Set<string>>(); // conversationId -> Set<connectionId>

  function joinRoom(connectionId: string, conversationId: string) {
    const roomSet = rooms.get(conversationId) ?? new Set<string>();
    roomSet.add(connectionId);
    rooms.set(conversationId, roomSet);

    const info = connections.get(connectionId);
    if (info) info.rooms.add(conversationId);
  }

  function leaveAllRooms(connectionId: string): void {
    const info = connections.get(connectionId);
    if (!info) return; // безопасная проверка

    Array.from(info.rooms).forEach((roomId) => {
      const roomSet = rooms.get(roomId);
      if (!roomSet) return;
      roomSet.delete(connectionId);
      if (roomSet.size === 0) rooms.delete(roomId);
    });

    // очистим набор комнат у этого соединения
    info.rooms.clear();
  }

  function broadcastToConversation(conversationId: string, message: any, excludeId?: string): void {
    const roomSet = rooms.get(conversationId);
    if (!roomSet) return;
    Array.from(roomSet).forEach((cid) => {
      if (cid === excludeId) return;
      const conn = connections.get(cid);
      if (conn && conn.ws && conn.ws.readyState === WebSocket.OPEN) {
        try {
          conn.ws.send(JSON.stringify(message));
        } catch (err) {
          console.error("Failed to send WS message:", err);
        }
      }
    });
  }

  async function getUserIdFromSession(req: any): Promise<string | null> {
    try {
      const cookies = cookie.parse(req.headers?.cookie || "");
      // поддержка как имени cookie 'sid' (у тебя в session name: "sid"), так и 'connect.sid' (по умолчанию)
      const raw = cookies["sid"] ?? cookies["connect.sid"];
      if (!raw) return null;

      let sid = raw;

      // Если cookie подписана (формат "s:<signedValue>"), убираем подпись корректно
      if (typeof sid === "string" && sid.startsWith("s:")) {
        const signedPart = sid.slice(2); // убираем "s:"
        const unsigned = signature.unsign(signedPart, process.env.SESSION_SECRET || "");
        if (!unsigned) {
          // подпись не прошла проверку
          return null;
        }
        sid = unsigned;
      }

      // Промисифицируем sessionStore.get
      const getAsync = promisify(sessionStore.get.bind(sessionStore));
      const sess = await getAsync(sid);
      return sess?.userId ?? null;
    } catch (err) {
      console.error("getUserIdFromSession error:", err);
      return null;
    }
  }

  wss.on("connection", async (ws, req) => {
    const userId = await getUserIdFromSession(req);
    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    const connectionId = crypto.randomUUID();
    // ИНИЦИАЛИЗИРУЕМ rooms прямо здесь:
    connections.set(connectionId, { ws, userId, rooms: new Set<string>() });

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join_conversation": {
            const { conversationId } = message.data;
            // проверяем права на беседу
            const convo = await storage.getConversation(conversationId);
            if (!convo || convo.userId !== userId) {
              ws.send(JSON.stringify({ type: "error", data: { message: "Access denied" } }));
              return;
            }
            joinRoom(connectionId, conversationId);
            return;
          }

          case "send_message": {
            const { conversationId, content } = message.data;
            const usage = await storage.getUserUsage(userId);
            if (usage.current >= usage.limit) {
              ws.send(JSON.stringify({ type: "error", data: { message: "Usage limit exceeded", usage } }));
              return;
            }
            const newUsage = await storage.incrementUsage(userId, 1);
            ws.send(JSON.stringify({ type: "usage_update", data: newUsage }));

            // проверка владения беседой
            const convo = await storage.getConversation(conversationId);
            if (!convo || convo.userId !== userId) {
              ws.send(JSON.stringify({ type: "error", data: { message: "Access denied" } }));
              return;
            }

            broadcastToConversation(conversationId, { type: "typing_start", data: { userId } }, connectionId);
            
            const lawMatches = (typeof searchLaws === "function") ? await searchLaws("TJ", content) : [];

            const aiResponse = await aiService.generateResponse(content, {
              conversationId,
              userId,
              planType: "free",
              lawMatches,
            });

            await storage.createMessage({
              conversationId,
              role: "assistant",
              content: aiResponse.content,
              metadata: aiResponse.metadata,
            });

            broadcastToConversation(conversationId, { type: "typing_stop", data: { userId } }, connectionId);

            broadcastToConversation(conversationId, {
              type: "new_message",
              data: {
                id: Date.now().toString(),
                conversationId,
                role: "assistant",
                content: aiResponse.content,
                timestamp: new Date().toISOString(),
              },
            });

            return;
          }

          case "typing_start":
          case "typing_stop": {
            const { conversationId } = message.data;
            broadcastToConversation(conversationId, message, connectionId);
            return;
          }

          default:
            ws.send(JSON.stringify({ type: "error", data: { message: "Unknown message type" } }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        try { ws.send(JSON.stringify({ type: "error", data: { message: "Server error" } })); } catch {}
      }
    });

    ws.on("close", () => {
      leaveAllRooms(connectionId);
      connections.delete(connectionId);
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  return httpServer;
}
