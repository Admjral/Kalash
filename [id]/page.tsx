import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GoalsService } from "@/lib/services/goals"
import GoalDetailClientPage from "./client-page"
import type { GoalWithSubGoals } from "@/lib/supabase"

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/signin")
  }

  let goal: GoalWithSubGoals | null = null
  let error: string | null = null

  try {
    const goalsService = new GoalsService(supabase)
    goal = await goalsService.getGoalById(params.id, user.id)
  } catch (e: any) {
    console.error(`Ошибка при загрузке цели ${params.id}:`, e.message)
    error = "Не удалось загрузить данные цели."
  }

  if (!goal) {
    // Можно показать страницу 404 или редирект
    // redirect('/dashboard')
  }

  return <GoalDetailClientPage initialGoal={goal} error={error} />
}
