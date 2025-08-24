import { createClient } from "@/lib/supabase/server"
import type { Achievement, AchievementInsert } from "@/lib/supabase/types"
import { AnalyticsService } from "./analytics-service"

export class AchievementsService {
  /**
   * Получает все достижения пользователя
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching achievements:", error)
      throw error
    }

    return data || []
  }

  /**
   * Получает последние достижения пользователя
   */
  static async getRecentAchievements(userId: string, limit = 3): Promise<Achievement[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent achievements:", error)
      throw error
    }

    return data || []
  }

  /**
   * Создает новое достижение
   */
  static async createAchievement(achievement: AchievementInsert): Promise<Achievement | null> {
    const supabase = createClient()

    const { data, error } = await supabase.from("achievements").insert(achievement).select().single()

    if (error) {
      console.error("Error creating achievement:", error)
      throw error
    }

    // Записываем аналитику получения достижения
    await AnalyticsService.recordMetric(achievement.user_id, "achievement_earned", achievement.points || 10, {
      achievement_id: data.id,
      achievement_title: achievement.title,
      achievement_type: achievement.type,
    })

    return data
  }

  /**
   * Создает достижение за завершение цели
   */
  static async createGoalCompletionAchievement(
    userId: string,
    goalId: string,
    goalTitle: string,
  ): Promise<Achievement | null> {
    const achievement: AchievementInsert = {
      user_id: userId,
      type: "goal_completed",
      title: `Цель достигнута: ${goalTitle}`,
      description: `Вы успешно завершили цель "${goalTitle}". Продолжайте в том же духе!`,
      icon: "🏆",
      points: 50,
      goal_id: goalId,
      metadata: {
        goal_title: goalTitle,
        completed_at: new Date().toISOString(),
      },
    }

    return await this.createAchievement(achievement)
  }

  /**
   * Создает достижение за достижение определенного прогресса
   */
  static async createMilestoneAchievement(
    userId: string,
    goalId: string,
    goalTitle: string,
    progress: number,
  ): Promise<Achievement | null> {
    // Создаем достижение только для определенных этапов прогресса
    if (progress !== 25 && progress !== 50 && progress !== 75) {
      return null
    }

    const milestoneTexts = {
      25: "Четверть пути",
      50: "Половина пути",
      75: "Почти у цели",
    }

    const milestoneIcons = {
      25: "🌱",
      50: "🌿",
      75: "🌳",
    }

    const achievement: AchievementInsert = {
      user_id: userId,
      type: "milestone_reached",
      title: `${milestoneTexts[progress as keyof typeof milestoneTexts]}: ${goalTitle}`,
      description: `Вы достигли ${progress}% прогресса в цели "${goalTitle}". Отличная работа!`,
      icon: milestoneIcons[progress as keyof typeof milestoneIcons],
      points: progress / 5, // 5, 10 или 15 очков
      goal_id: goalId,
      metadata: {
        goal_title: goalTitle,
        progress: progress,
        reached_at: new Date().toISOString(),
      },
    }

    return await this.createAchievement(achievement)
  }

  /**
   * Создает достижение за завершение коучинг-сессии
   */
  static async createSessionCompletionAchievement(
    userId: string,
    sessionId: string,
    sessionType: string,
  ): Promise<Achievement | null> {
    const sessionTypeTexts = {
      "goal-setting": "постановки целей",
      "progress-review": "анализа прогресса",
      "problem-solving": "решения проблем",
      "emotional-support": "эмоциональной поддержки",
    }

    const sessionTypeIcons = {
      "goal-setting": "🎯",
      "progress-review": "📊",
      "problem-solving": "🧩",
      "emotional-support": "🌈",
    }

    const typeText = sessionTypeTexts[sessionType as keyof typeof sessionTypeTexts] || "коучинга"
    const icon = sessionTypeIcons[sessionType as keyof typeof sessionTypeIcons] || "🔍"

    const achievement: AchievementInsert = {
      user_id: userId,
      type: "session_completed",
      title: `Завершена сессия ${typeText}`,
      description: `Вы успешно завершили коучинг-сессию. Новые знания и инсайты помогут вам достичь ваших целей!`,
      icon: icon,
      points: 20,
      session_id: sessionId,
      metadata: {
        session_type: sessionType,
        completed_at: new Date().toISOString(),
      },
    }

    return await this.createAchievement(achievement)
  }

  /**
   * Создает достижение за серию завершенных целей
   */
  static async createStreakAchievement(userId: string, count: number): Promise<Achievement | null> {
    // Создаем достижение только для определенного количества целей
    if (count !== 3 && count !== 5 && count !== 10) {
      return null
    }

    const streakTexts = {
      3: "Хет-трик",
      5: "Пятерка лучших",
      10: "Десятка!",
    }

    const streakIcons = {
      3: "🔥",
      5: "⭐",
      10: "🌟",
    }

    const achievement: AchievementInsert = {
      user_id: userId,
      type: "streak_achieved",
      title: streakTexts[count as keyof typeof streakTexts],
      description: `Вы завершили ${count} целей! Ваша настойчивость впечатляет!`,
      icon: streakIcons[count as keyof typeof streakIcons],
      points: count * 10,
      metadata: {
        streak_count: count,
        achieved_at: new Date().toISOString(),
      },
    }

    return await this.createAchievement(achievement)
  }
}
