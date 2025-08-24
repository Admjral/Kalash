import { createClient } from "@/lib/supabase/server"
import type { CoachingSession, CoachingSessionInsert, CoachingSessionUpdate } from "@/lib/supabase/types"
import { AchievementsService } from "./achievements-service"
import { AnalyticsService } from "./analytics-service"

export class CoachingService {
  /**
   * Получает все коучинг-сессии пользователя
   */
  static async getUserSessions(userId: string): Promise<CoachingSession[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("coaching_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching coaching sessions:", error)
      throw error
    }

    return data || []
  }

  /**
   * Получает активную сессию пользователя
   */
  static async getActiveSession(userId: string): Promise<CoachingSession | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("coaching_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Нет активных сессий
        return null
      }
      console.error("Error fetching active session:", error)
      throw error
    }

    return data
  }

  /**
   * Получает сессию по ID
   */
  static async getSessionById(sessionId: string): Promise<CoachingSession | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("coaching_sessions").select("*").eq("id", sessionId).single()

    if (error) {
      console.error("Error fetching session:", error)
      return null
    }

    return data
  }

  /**
   * Создает новую коучинг-сессию
   */
  static async createSession(session: CoachingSessionInsert): Promise<CoachingSession | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("coaching_sessions").insert(session).select().single()

    if (error) {
      console.error("Error creating coaching session:", error)
      throw error
    }

    // Записываем аналитику создания сессии
    await AnalyticsService.recordMetric(session.user_id, "session_started", 1, {
      session_id: data.id,
      session_type: session.session_type,
    })

    return data
  }

  /**
   * Обновляет коучинг-сессию
   */
  static async updateSession(sessionId: string, updates: CoachingSessionUpdate): Promise<CoachingSession | null> {
    const supabase = createClient()

    // Получаем текущее состояние сессии
    const { data: currentSession } = await supabase.from("coaching_sessions").select("*").eq("id", sessionId).single()

    if (!currentSession) {
      console.error("Session not found")
      return null
    }

    // Обновляем сессию
    const { data, error } = await supabase
      .from("coaching_sessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      console.error("Error updating coaching session:", error)
      throw error
    }

    // Если статус изменился на "completed", создаем достижение
    if (updates.status === "completed" && currentSession.status !== "completed") {
      await AchievementsService.createSessionCompletionAchievement(
        currentSession.user_id,
        sessionId,
        currentSession.session_type,
      )

      // Записываем аналитику завершения сессии
      const duration =
        updates.duration_minutes ||
        Math.round((new Date().getTime() - new Date(currentSession.created_at).getTime()) / 60000)

      await AnalyticsService.recordSessionCompletion(currentSession.user_id, sessionId, duration)
    }

    return data
  }

  /**
   * Добавляет сообщение в коучинг-сессию
   */
  static async addMessage(sessionId: string, message: any): Promise<CoachingSession | null> {
    const supabase = createClient()

    // Получаем текущие сообщения
    const { data: currentSession } = await supabase
      .from("coaching_sessions")
      .select("messages")
      .eq("id", sessionId)
      .single()

    if (!currentSession) {
      console.error("Session not found")
      return null
    }

    // Добавляем новое сообщение
    const messages = Array.isArray(currentSession.messages) ? [...currentSession.messages, message] : [message]

    // Обновляем сессию
    const { data, error } = await supabase
      .from("coaching_sessions")
      .update({ messages, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      console.error("Error adding message to session:", error)
      throw error
    }

    return data
  }

  /**
   * Добавляет инсайты в коучинг-сессию
   */
  static async addInsights(sessionId: string, insights: any): Promise<CoachingSession | null> {
    const supabase = createClient()

    // Обновляем сессию
    const { data, error } = await supabase
      .from("coaching_sessions")
      .update({ insights, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      console.error("Error adding insights to session:", error)
      throw error
    }

    return data
  }

  /**
   * Получает последние инсайты пользователя
   */
  static async getLatestInsights(userId: string, limit = 3): Promise<any[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("coaching_sessions")
      .select("insights, created_at")
      .eq("user_id", userId)
      .not("insights", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching insights:", error)
      throw error
    }

    // Извлекаем инсайты из сессий
    const insights =
      data
        ?.filter((session) => session.insights)
        .map((session) => ({
          ...session.insights,
          created_at: session.created_at,
        })) || []

    return insights
  }
}
