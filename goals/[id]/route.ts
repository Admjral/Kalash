import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { GoalsService } from "@/lib/services/goals"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalsService = new GoalsService(supabase)
    const goal = await goalsService.getGoalById(params.id, user.id)
    return NextResponse.json({ goal })
  } catch (error) {
    console.error("Error fetching goal:", error)
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, priority, progress, status, deadline } = body

    const goalsService = new GoalsService(supabase)
    const goal = await goalsService.updateGoal(
      params.id,
      {
        title,
        description,
        category,
        priority,
        progress,
        status,
        deadline,
      },
      user.id,
    )

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalsService = new GoalsService(supabase)
    await goalsService.deleteGoal(params.id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
