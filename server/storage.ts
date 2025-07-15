import { db } from "./db";
import { 
  users, 
  conversations, 
  messages, 
  documentAnalyses,
  userUsage,
  type User,
  type Conversation,
  type Message,
  type DocumentAnalysis,
  type UserUsage,
  type InsertUser,
  type InsertConversation,
  type InsertMessage,
  type InsertDocumentAnalysis,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Usage tracking
  getUserUsage(userId: string): Promise<UserUsage>;
  incrementUsage(userId: string, count: number): Promise<UserUsage>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  deleteConversationFully(conversationId: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  updateConversation(id: string, data: Partial<InsertConversation>): Promise<void>;
  updateConversationMetadata(conversationId: string, updates: Partial<Pick<Conversation, "title" | "category">>): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  
  // Document analysis operations
  createDocumentAnalysis(analysis: InsertDocumentAnalysis): Promise<DocumentAnalysis>;
  getUserDocumentAnalyses(userId: string): Promise<DocumentAnalysis[]>;
  getDocumentAnalysis(id: string): Promise<DocumentAnalysis | undefined>;
}

function toCamelCase<T extends Record<string, any>>(row: T): T {
  const result: Record<string, any> = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    result[camelKey] = row[key];
  }
  return result as T;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ? toCamelCase(user) as User : undefined;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async deleteConversationFully(conversationId: string): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    await db.delete(conversations).where(eq(conversations.id, conversationId));
  }

  async updateConversationMetadata(conversationId: string, updates: Partial<Pick<Conversation, "title" | "category">>): Promise<void> {
    await db
      .update(conversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));
  }

  async updateConversation(id: string, data: Partial<InsertConversation>): Promise<void> {
    await db.update(conversations)
      .set(data)
      .where(eq(conversations.id, id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ? toCamelCase(user) as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  // Usage tracking
  async getUserUsage(userId: string): Promise<UserUsage> {
    let [usage] = await db.select().from(userUsage).where(eq(userUsage.userId, userId));
    
    if (!usage) {
      // Ensure user exists first
      let user = await this.getUser(userId);
      if (!user) {
        if (!usage) {
          throw new Error("User usage not found. User must be registered.");
        }
      }
      
      // Create default usage record for demo user
      [usage] = await db.insert(userUsage).values({
        userId,
        current: 0,
        limit: 150, // Premium for demo
        period: "month",
        planType: "premium",
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).returning();
    }

    // Check if usage period has reset
    if (new Date() > usage.resetDate) {
      [usage] = await db
        .update(userUsage)
        .set({
          current: 0,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .where(eq(userUsage.userId, userId))
        .returning();
    }

    return usage;
  }

  async incrementUsage(userId: string, count: number): Promise<UserUsage> {
    // First get the current usage
    const currentUsage = await this.getUserUsage(userId);
    
    // Then update it
    const [usage] = await db
      .update(userUsage)
      .set({
        current: currentUsage.current + count,
      })
      .where(eq(userUsage.userId, userId))
      .returning();
    
    return usage;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const conversationWithId = {
      ...conversation,
      id: conversation.id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [result] = await db
      .insert(conversations)
      .values(conversationWithId)
      .returning();
    return result;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getUserConversationsWithMessageCount(userId: string): Promise<(Conversation & { messageCount: number })[]> {
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    const result = await Promise.all(
      convs.map(async (conv) => {
        const messagesInConv = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id));
        return {
          ...conv,
          messageCount: messagesInConv.length,
        };
      })
    );

    return result;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const messageWithId = {
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const [result] = await db
      .insert(messages)
      .values(messageWithId)
      .returning();
    
    // Update conversation's updated timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return result;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Document analysis operations
  async createDocumentAnalysis(analysis: InsertDocumentAnalysis): Promise<DocumentAnalysis> {
    const [result] = await db
      .insert(documentAnalyses)
      .values(analysis)
      .returning();
    return result;
  }

  async getUserDocumentAnalyses(userId: string): Promise<DocumentAnalysis[]> {
    return await db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.userId, userId))
      .orderBy(desc(documentAnalyses.createdAt));
  }

  async getDocumentAnalysis(id: string): Promise<DocumentAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.id, id));
    return analysis;
  }
}

export const storage = new DatabaseStorage();
