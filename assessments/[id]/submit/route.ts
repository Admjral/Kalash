import { createClient } from "@/lib/supabase/server"
import { AssessmentsService } from "@/lib/services/assessments"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { answers } = await req.json()
    const resultId = params.id

    if (!resultId) {
      return NextResponse.json({ error: "Result ID is required" }, { status: 400 })
    }

    const assessmentsService = new AssessmentsService(supabase)
    const result = await assessmentsService.submitAssessment(resultId, user.id, answers)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error submitting assessment:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
