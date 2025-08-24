import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { GoalsService } from "@/lib/services/goals"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalsService = new GoalsService(supabase)
    const goals = await goalsService.getUserGoals(user.id)
    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, priority, deadline } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const goalsService = new GoalsService(supabase)
    const goal = await goalsService.createGoal({
      user_id: user.id,
      title,
      description,
      category,
      priority,
      deadline,
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
