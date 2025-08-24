import { createClient } from "@/lib/supabase/server"
import type { Goal, GoalInsert, GoalUpdate, Subgoal, SubgoalInsert } from "@/lib/supabase/types"
import { AchievementsService } from "./achievements-service"
import { AnalyticsService } from "./analytics-service"

export class GoalsService {
  /**
   * Получает все цели пользователя
   */
  static async getUserGoals(userId: string): Promise<Goal[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
      throw error
    }

    return data || []
  }

  /**
   * Получает активные цели пользователя
   */
  static async getActiveGoals(userId: string): Promise<Goal[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("priority", { ascending: false })
      .order("deadline", { ascending: true })

    if (error) {
      console.error("Error fetching active goals:", error)
      throw error
    }

    return data || []
  }

  /**
   * Получает цель по ID
   */
  static async getGoalById(goalId: string): Promise<Goal | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("goals").select("*").eq("id", goalId).single()

    if (error) {
      console.error("Error fetching goal:", error)
      return null
    }

    return data
  }

  /**
   * Создает новую цель
   */
  static async createGoal(goal: GoalInsert): Promise<Goal | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("goals").insert(goal).select().single()

    if (error) {
      console.error("Error creating goal:", error)
      throw error
    }

    // Записываем аналитику создания цели
    await AnalyticsService.recordMetric(goal.user_id, "goal_created", 1, { goal_id: data.id, goal_title: goal.title })

    return data
  }

  /**
   * Обновляет цель
   */
  static async updateGoal(goalId: string, updates: GoalUpdate): Promise<Goal | null> {
    const supabase = createClient()

    // Получаем текущее состояние цели
    const { data: currentGoal } = await supabase.from("goals").select("*").eq("id", goalId).single()

    if (!currentGoal) {
      console.error("Goal not found")
      return null
    }

    // Обновляем цель
    const { data, error } = await supabase.from("goals").update(updates).eq("id", goalId).select().single()

    if (error) {
      console.error("Error updating goal:", error)
      throw error
    }

    // Если статус изменился на "completed", создаем достижение
    if (updates.status === "completed" && currentGoal.status !== "completed") {
      await AchievementsService.createGoalCompletionAchievement(currentGoal.user_id, goalId, currentGoal.title)

      // Записываем аналитику завершения цели
      await AnalyticsService.recordGoalCompletion(currentGoal.user_id, goalId, currentGoal.title)
    }

    // Если прогресс изменился, записываем аналитику
    if (updates.progress !== undefined && updates.progress !== currentGoal.progress) {
      await AnalyticsService.recordGoalProgress(currentGoal.user_id, goalId, updates.progress)
    }

    return data
  }

  /**
   * Удаляет цель
   */
  static async deleteGoal(goalId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.from("goals").delete().eq("id", goalId)

    if (error) {
      console.error("Error deleting goal:", error)
      throw error
    }
  }

  /**
   * Получает подцели для цели
   */
  static async getSubgoals(goalId: string): Promise<Subgoal[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("subgoals")
      .select("*")
      .eq("goal_id", goalId)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching subgoals:", error)
      throw error
    }

    return data || []
  }

  /**
   * Создает подцель
   */
  static async createSubgoal(subgoal: SubgoalInsert): Promise<Subgoal | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("subgoals").insert(subgoal).select().single()

    if (error) {
      console.error("Error creating subgoal:", error)
      throw error
    }

    // Обновляем прогресс основной цели
    await this.updateGoalProgressFromSubgoals(subgoal.goal_id)

    return data
  }

  /**
   * Обновляет подцель
   */
  static async updateSubgoal(subgoalId: string, updates: any): Promise<Subgoal | null> {
    const supabase = createClient()

    // Получаем текущую подцель для определения goal_id
    const { data: currentSubgoal } = await supabase.from("subgoals").select("*").eq("id", subgoalId).single()

    if (!currentSubgoal) {
      console.error("Subgoal not found")
      return null
    }

    const { data, error } = await supabase.from("subgoals").update(updates).eq("id", subgoalId).select().single()

    if (error) {
      console.error("Error updating subgoal:", error)
      throw error
    }

    // Если статус изменился, обновляем прогресс основной цели
    if (updates.status && updates.status !== currentSubgoal.status) {
      await this.updateGoalProgressFromSubgoals(currentSubgoal.goal_id)
    }

    return data
  }

  /**
   * Удаляет подцель
   */
  static async deleteSubgoal(subgoalId: string): Promise<void> {
    const supabase = createClient()

    // Получаем текущую подцель для определения goal_id
    const { data: currentSubgoal } = await supabase.from("subgoals").select("*").eq("id", subgoalId).single()

    if (!currentSubgoal) {
      console.error("Subgoal not found")
      return
    }

    const { error } = await supabase.from("subgoals").delete().eq("id", subgoalId)

    if (error) {
      console.error("Error deleting subgoal:", error)
      throw error
    }

    // Обновляем прогресс основной цели
    await this.updateGoalProgressFromSubgoals(currentSubgoal.goal_id)
  }

  /**
   * Обновляет прогресс цели на основе статусов подцелей
   */
  static async updateGoalProgressFromSubgoals(goalId: string): Promise<void> {
    const supabase = createClient()

    // Получаем все подцели
    const { data: subgoals, error } = await supabase.from("subgoals").select("*").eq("goal_id", goalId)

    if (error) {
      console.error("Error fetching subgoals for progress update:", error)
      return
    }

    if (!subgoals || subgoals.length === 0) {
      return
    }

    // Считаем прогресс
    const totalSubgoals = subgoals.length
    const completedSubgoals = subgoals.filter((sg) => sg.status === "completed").length
    const inProgressSubgoals = subgoals.filter((sg) => sg.status === "in_progress").length

    // Вычисляем процент выполнения
    const progress = Math.round(((completedSubgoals + inProgressSubgoals * 0.5) / totalSubgoals) * 100)

    // Обновляем прогресс цели
    await supabase.from("goals").update({ progress }).eq("id", goalId)

    // Получаем информацию о цели для аналитики
    const { data: goal } = await supabase.from("goals").select("user_id").eq("id", goalId).single()

    if (goal) {
      // Записываем аналитику обновления прогресса
      await AnalyticsService.recordGoalProgress(goal.user_id, goalId, progress)
    }
  }
}
