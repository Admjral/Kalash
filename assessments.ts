import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, AssessmentTemplate, AssessmentResult, Json } from "@/lib/supabase"

export class AssessmentsService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }

  async getAvailableTemplates(): Promise<AssessmentTemplate[]> {
    const { data, error } = await this.supabase.from("assessment_templates").select("*")

    if (error) {
      console.error("Error fetching assessment templates:", error)
      throw new Error("Не удалось загрузить список тестов.")
    }
    return data || []
  }

  async getTemplateById(templateId: string): Promise<AssessmentTemplate | null> {
    const { data, error } = await this.supabase.from("assessment_templates").select("*").eq("id", templateId).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      console.error("Error fetching assessment template:", error)
      throw new Error("Не удалось найти шаблон теста.")
    }
    return data
  }

  async createAssessmentResult(userId: string, templateId: string): Promise<AssessmentResult> {
    const { data, error } = await this.supabase
      .from("assessment_results")
      .insert({
        user_id: userId,
        template_id: templateId,
        answers: {}, // Start with empty answers
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating assessment result:", error)
      throw new Error("Не удалось начать тест.")
    }
    return data
  }

  async submitAssessment(resultId: string, userId: string, answers: Json): Promise<AssessmentResult> {
    // Простая логика подсчета очков и интерпретации (можно усложнить)
    let score = 0
    if (typeof answers === "object" && answers !== null && !Array.isArray(answers)) {
      score = Object.values(answers).reduce((acc: number, val) => acc + (Number(val) || 0), 0)
    }
    const interpretation = `Ваш результат: ${score}. Это предварительная оценка, ваш коуч поможет разобраться детальнее.`

    const { data, error } = await this.supabase
      .from("assessment_results")
      .update({
        answers,
        score,
        interpretation,
        completed_at: new Date().toISOString(),
      })
      .eq("id", resultId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error submitting assessment:", error)
      throw new Error("Не удалось завершить тест.")
    }
    return data
  }

  async getAssessmentResult(
    resultId: string,
    userId: string,
  ): Promise<(AssessmentResult & { assessment_templates: AssessmentTemplate | null }) | null> {
    const { data, error } = await this.supabase
      .from("assessment_results")
      .select(
        `
        *,
        assessment_templates (*)
      `,
      )
      .eq("id", resultId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      console.error("Error fetching assessment result:", error)
      throw new Error("Не удалось загрузить результат теста.")
    }
    return data
  }
}
