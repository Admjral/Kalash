import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/route-handler"
import { GoalsService } from "@/lib/services/goals"
import type { SubGoal } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Не авторизован" }), { status: 401 })
  }

  const goalId = params.id
  const subgoals: Partial<SubGoal>[] = await request.json()

  if (!goalId) {
    return new NextResponse(JSON.stringify({ error: "ID цели не указан" }), { status: 400 })
  }

  try {
    // ПРАВИЛЬНЫЙ ВЫЗОВ: Создаем экземпляр сервиса
    const goalsService = new GoalsService(supabase)
    const savedSubgoals = await goalsService.saveSubGoals(goalId, user.id, subgoals)

    // Принудительно пересчитываем прогресс после сохранения
    await supabase.rpc("update_goal_progress", { g_id: goalId })

    return NextResponse.json(savedSubgoals)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка"
    console.error("Ошибка при сохранении подцелей:", errorMessage)
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 })
  }
}
