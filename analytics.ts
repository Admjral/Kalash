import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"

export class AnalyticsService {
  static async getGoalProgressHistory(supabase: SupabaseClient<Database>, userId: string, goalId?: string) {
    let query = supabase
      .from("goal_progress_history")
      .select(`
        *,
        goals (title)
      `)
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true })

    if (goalId) {
      query = query.eq("goal_id", goalId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching goal progress history:", error)
      throw new Error("Failed to fetch goal progress history")
    }

    return data
  }

  static async getUserStats(supabase: SupabaseClient<Database>, userId: string) {
    // Получаем статистику по целям
    const { data: goalsStats, error: goalsError } = await supabase
      .from("goals")
      .select("status, progress")
      .eq("user_id", userId)

    if (goalsError) {
      console.error("Error fetching goals stats:", goalsError)
      throw new Error("Failed to fetch goals stats")
    }

    // Получаем статистику по сессиям
    const { data: sessionsStats, error: sessionsError } = await supabase
      .from("coaching_sessions")
      .select("status, session_rating, duration_minutes")
      .eq("user_id", userId)

    if (sessionsError) {
      console.error("Error fetching sessions stats:", sessionsError)
      throw new Error("Failed to fetch sessions stats")
    }

    // Получаем статистику по оценкам
    const { data: assessmentsStats, error: assessmentsError } = await supabase
      .from("assessments")
      .select("score, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)

    if (assessmentsError) {
      console.error("Error fetching assessments stats:", assessmentsError)
      throw new Error("Failed to fetch assessments stats")
    }

    // Вычисляем статистику
    const totalGoals = goalsStats.length
    const activeGoals = goalsStats.filter((g) => g.status === "active").length
    const completedGoals = goalsStats.filter((g) => g.status === "completed").length
    const averageProgress =
      totalGoals > 0 ? Math.round(goalsStats.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals) : 0

    const totalSessions = sessionsStats.length
    const completedSessions = sessionsStats.filter((s) => s.status === "completed").length
    const averageRating =
      completedSessions > 0
        ? sessionsStats.filter((s) => s.session_rating).reduce((sum, s) => sum + (s.session_rating || 0), 0) /
          completedSessions
        : 0

    const totalAssessments = assessmentsStats.length
    const averageAssessmentScore =
      totalAssessments > 0 ? assessmentsStats.reduce((sum, a) => sum + (a.score || 0), 0) / totalAssessments : 0

    return {
      goals: {
        total: totalGoals,
        active: activeGoals,
        completed: completedGoals,
        averageProgress,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      assessments: {
        total: totalAssessments,
        averageScore: Math.round(averageAssessmentScore),
      },
    }
  }

  static async recordGoalProgress(
    supabase: SupabaseClient<Database>,
    goalId: string,
    userId: string,
    progress: number,
  ) {
    const { error } = await supabase.from("goal_progress_history").insert({
      goal_id: goalId,
      user_id: userId,
      progress,
    })

    if (error) {
      console.error("Error recording goal progress:", error)
      throw new Error("Failed to record goal progress")
    }

    return true
  }
}
