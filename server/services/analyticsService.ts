import { db } from "../db";
import { and, eq, gte, lt } from "drizzle-orm";
import { messages, documentAnalyses, conversations } from "@shared/schema";
import { type UserAnalytics } from "@shared/analytics";

class AnalyticsService {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [currentMonthMessages, lastMonthMessages, currentMonthDocs, lastMonthDocs] = await Promise.all([
      // Текущий месяц - сообщения
      db.select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        role: messages.role,
        // Если helpful это метаданные в JSON
        metadata: messages.metadata
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(conversations.userId, userId),
          gte(messages.createdAt, startOfMonth)
        )
      ),
      // Прошлый месяц - сообщения
      db.select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        role: messages.role,
        metadata: messages.metadata
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(conversations.userId, userId),
          gte(messages.createdAt, startOfLastMonth),
          lt(messages.createdAt, startOfMonth)
        )
      ),
      // Текущий месяц - документы
      db.select().from(documentAnalyses).where(
        and(
          eq(documentAnalyses.userId, userId),
          gte(documentAnalyses.createdAt, startOfMonth)
        )
      ),
      // Прошлый месяц - документы
      db.select().from(documentAnalyses).where(
        and(
          eq(documentAnalyses.userId, userId),
          gte(documentAnalyses.createdAt, startOfLastMonth),
          lt(documentAnalyses.createdAt, startOfMonth)
        )
      )
    ]);

    // Подсчет успешных ответов
    const helpfulnessCurrentMonth = currentMonthMessages.length > 0
      ? (currentMonthMessages.filter(m => {
          const meta = m.metadata as { helpful?: boolean };
          return meta?.helpful ?? false;
        }).length / currentMonthMessages.length) * 100
      : 0;

    const helpfulnessLastMonth = lastMonthMessages.length > 0
      ? (lastMonthMessages.filter(m => {
          const meta = m.metadata as { helpful?: boolean };
          return meta?.helpful ?? false;
        }).length / lastMonthMessages.length) * 100
      : 0;
      
    // Рассчитываем показатели успешности для текущего и прошлого месяца
    const currentSuccessRate = currentMonthMessages.length > 0
      ? (currentMonthMessages.filter(m => {
          const meta = m.metadata as { helpful?: boolean };
          return meta?.helpful === true;
        }).length / currentMonthMessages.length) * 100
      : 0;

    const lastSuccessRate = lastMonthMessages.length > 0
      ? (lastMonthMessages.filter(m => {
          const meta = m.metadata as { helpful?: boolean };
          return meta?.helpful === true;
        }).length / lastMonthMessages.length) * 100
      : 0;

    // Оценка сэкономленного времени (15 минут на вопрос)
    const currentHours = (currentMonthMessages.length * 15) / 60;
    const lastHours = (lastMonthMessages.length * 15) / 60;

    return {
      questionsAsked: {
        current: currentMonthMessages.length,
        lastMonth: lastMonthMessages.length,
      },
      documentsAnalyzed: {
        current: currentMonthDocs.length,
        lastMonth: lastMonthDocs.length,
      },
      hoursEstimated: {
        current: currentHours,
        lastMonth: lastHours,
      },
      successRate: {
        current: currentSuccessRate,
        lastMonth: lastSuccessRate,
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
