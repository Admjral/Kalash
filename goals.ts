import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Goal, SubGoal, GoalWithSubGoals } from "@/lib/supabase"

export class GoalsService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }

  async getUserGoals(userId: string): Promise<GoalWithSubGoals[]> {
    const { data: goals, error: goalsError } = await this.supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (goalsError) {
      console.error("Error fetching goals:", goalsError.message)
      throw new Error("Failed to fetch goals.")
    }
    if (!goals) {
      return []
    }

    const goalIds = goals.map((g) => g.id)
    if (goalIds.length === 0) {
      return goals.map((goal) => ({ ...goal, subgoals: [] }))
    }

    const { data: subgoals, error: subgoalsError } = await this.supabase
      .from("subgoals")
      .select("*")
      .in("goal_id", goalIds)
      .order("order_index", { ascending: true })

    if (subgoalsError) {
      console.error("Error fetching subgoals:", subgoalsError.message)
      throw new Error("Failed to fetch subgoals.")
    }

    const goalsWithSubgoals = goals.map((goal) => ({
      ...goal,
      subgoals: subgoals?.filter((subgoal) => subgoal.goal_id === goal.id) || [],
    }))

    return goalsWithSubgoals
  }

  async getGoalById(goalId: string, userId: string): Promise<GoalWithSubGoals | null> {
    const { data: goal, error: goalError } = await this.supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", userId)
      .single()

    if (goalError) {
      if (goalError.code === "PGRST116") return null // Not found
      console.error("Error fetching goal by ID:", goalError.message)
      throw new Error("Failed to fetch goal.")
    }
    if (!goal) return null

    const { data: subgoals, error: subgoalsError } = await this.supabase
      .from("subgoals")
      .select("*")
      .eq("goal_id", goal.id)
      .eq("user_id", userId)
      .order("order_index", { ascending: true })

    if (subgoalsError) {
      console.error("Error fetching subgoals for goal:", subgoalsError.message)
      throw new Error("Failed to fetch subgoals for goal.")
    }

    return { ...goal, subgoals: subgoals || [] }
  }

  async createGoal(
    goalData: Omit<Goal, "id" | "created_at" | "updated_at" | "progress" | "status"> & {
      status?: "active" | "completed" | "on_hold" | "archived"
      progress?: number
      deadline?: string
    },
  ): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .insert({
        user_id: goalData.user_id,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        priority: goalData.priority,
        due_date: goalData.deadline,
        status: goalData.status || "active",
        progress: goalData.progress || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating goal:", error.message)
      throw new Error(`Failed to create goal: ${error.message}`)
    }
    return data
  }

  async updateGoal(
    goalId: string,
    updates: Partial<Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">> & { deadline?: string },
    userId: string,
  ): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .update({
        title: updates.title,
        description: updates.description,
        category: updates.category,
        priority: updates.priority,
        progress: updates.progress,
        status: updates.status,
        due_date: updates.deadline,
      })
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating goal:", error.message)
      throw new Error(`Failed to update goal: ${error.message}`)
    }
    return data
  }

  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from("goals").delete().eq("id", goalId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting goal:", error.message)
      throw new Error(`Failed to delete goal: ${error.message}`)
    }
  }

  async saveSubGoals(goalId: string, userId: string, subgoals: Partial<SubGoal>[]): Promise<SubGoal[]> {
    // Удаляем существующие подцели для этой цели
    const { error: deleteError } = await this.supabase
      .from("subgoals")
      .delete()
      .eq("goal_id", goalId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting existing subgoals:", deleteError.message)
      throw new Error(`Failed to clear existing subgoals: ${deleteError.message}`)
    }

    // Вставляем новые/обновленные подцели
    const subgoalsToInsert = subgoals.map((sg, index) => ({
      ...sg,
      goal_id: goalId,
      user_id: userId,
      order_index: index,
      status: sg.status || "not_started",
      title: sg.title || "Новая подцель", // Обеспечиваем наличие title
    }))

    const { data, error: insertError } = await this.supabase
      .from("subgoals")
      .insert(subgoalsToInsert)
      .select()
      .order("order_index", { ascending: true })

    if (insertError) {
      console.error("Error inserting new subgoals:", insertError.message)
      throw new Error(`Failed to save subgoals: ${insertError.message}`)
    }

    return data || []
  }
}
