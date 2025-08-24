import { createClient } from "@/lib/supabase/server"
import type { AnalyticsInsert } from "@/lib/supabase/types"

export class AnalyticsService {
  /**
   * Записывает метрику в базу данных
   */
  static async recordMetric(userId: string, metricType: string, metricValue: number, metadata?: any) {
    const supabase = createClient()

    const metric: AnalyticsInsert = {
      user_id: userId,
      metric_type: metricType,
      metric_value: metricValue,
      metadata: metadata || {},
      recorded_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("analytics").insert(metric)

    if (error) {
      console.error("Error recording metric:", error)
      throw error
    }
  }

  /**
   * Получает аналитику по типу метрики
   */
  static async getMetricsByType(userId: string, metricType: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("user_id", userId)
      .eq("metric_type", metricType)
      .order("recorded_at", { ascending: false })

    if (error) {
      console.error("Error fetching metrics:", error)
      throw error
    }

    return data
  }

  /**
   * Получает агрегированную аналитику по типу метрики
   */
  static async getAggregatedMetrics(userId: string, metricType: string, period: "day" | "week" | "month" = "week") {
    const supabase = createClient()

    // Определяем период для фильтрации
    const now = new Date()
    const startDate = new Date()

    if (period === "day") {
      startDate.setDate(now.getDate() - 1)
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    }

    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("user_id", userId)
      .eq("metric_type", metricType)
      .gte("recorded_at", startDate.toISOString())
      .order("recorded_at", { ascending: true })

    if (error) {
      console.error("Error fetching aggregated metrics:", error)
      throw error
    }

    return data
  }

  /**
   * Записывает событие завершения цели
   */
  static async recordGoalCompletion(userId: string, goalId: string, goalTitle: string) {
    await this.recordMetric(userId, "goal_completed", 1, {
      goal_id: goalId,
      goal_title: goalTitle,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Записывает событие обновления прогресса цели
   */
  static async recordGoalProgress(userId: string, goalId: string, progress: number) {
    await this.recordMetric(userId, "goal_progress", progress, {
      goal_id: goalId,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Записывает событие завершения коучинг-сессии
   */
  static async recordSessionCompletion(userId: string, sessionId: string, duration: number) {
    await this.recordMetric(userId, "session_completed", duration, {
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    })
  }
}
