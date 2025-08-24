import { createClient } from "@/lib/supabase/server"
import { AssessmentsService } from "@/lib/services/assessments"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AssessmentResultsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const assessmentsService = new AssessmentsService(supabase)
  const result = await assessmentsService.getAssessmentResult(params.id, user.id)

  if (!result || !result.assessment_templates) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Результаты теста: {result.assessment_templates.title}</CardTitle>
          <CardDescription>Тест завершен {new Date(result.completed_at).toLocaleString("ru-RU")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Ваш результат</h3>
            <p className="text-4xl font-bold">{result.score}</p>
          </div>
          <div>
            <h3 className="font-semibold">Интерпретация</h3>
            <p className="text-muted-foreground">{result.interpretation}</p>
          </div>
          <Link href="/dashboard">
            <Button>Вернуться на главную</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
