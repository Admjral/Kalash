import { createClient } from "@/lib/supabase/server"
import { AssessmentsService } from "@/lib/services/assessments"
import { redirect } from "next/navigation"

// Эта страница-действие создает новую сессию теста и перенаправляет на нее
export default async function StartAssessmentPage({ params }: { params: { templateId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const assessmentsService = new AssessmentsService(supabase)
  try {
    // Создаем новую запись о результате теста
    const result = await assessmentsService.createAssessmentResult(user.id, params.templateId)
    // Перенаправляем пользователя на страницу прохождения теста с ID результата
    redirect(`/assessments/${result.id}`)
  } catch (error) {
    console.error("Failed to start assessment:", error)
    // В случае ошибки, перенаправляем обратно на список тестов
    redirect("/assessments?error=start_failed")
  }
}
