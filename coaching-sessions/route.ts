import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { CoachingService } from "@/lib/services/coaching"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await CoachingService.getUserSessions(supabase, user.id)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching coaching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch coaching sessions" }, { status: 500 })
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
    const { session_type, title, goals_discussed } = body

    if (!session_type || !title) {
      return NextResponse.json({ error: "session_type and title are required" }, { status: 400 })
    }

    const session = await CoachingService.createSession(supabase, {
      user_id: user.id,
      session_type,
      title,
      goals_discussed: goals_discussed || [],
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error creating coaching session:", error)
    return NextResponse.json({ error: "Failed to create coaching session" }, { status: 500 })
  }
}
