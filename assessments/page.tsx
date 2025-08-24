import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Target, TrendingUp, Users } from "lucide-react"

export default async function AssessmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Простые шаблоны оценок для демонстрации
  const templates = [
    {
      id: "personality",
      title: "Анализ личности",
      description: "Определите свои сильные стороны и области для развития",
      icon: Brain,
      color: "text-blue-600",
    },
    {
      id: "goals",
      title: "Оценка целей",
      description: "Проанализируйте свои цели и мотивацию",
      icon: Target,
      color: "text-green-600",
    },
    {
      id: "skills",
      title: "Навыки и компетенции",
      description: "Оцените свои профессиональные навыки",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      id: "leadership",
      title: "Лидерские качества",
      description: "Определите свой стиль лидерства",
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Центр Оценки</h1>
          <p className="text-muted-foreground">Пройдите тесты, чтобы лучше понять себя и свои сильные стороны.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {templates.map((template) => {
            const IconComponent = template.icon
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`h-8 w-8 ${template.color}`} />
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/dashboard`}>
                    <Button className="w-full">Начать тест</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-0">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Скоро появятся новые тесты!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Мы работаем над добавлением более детальных психометрических тестов и оценок.
              </p>
              <Link href="/dashboard">
                <Button variant="outline">Вернуться к дашборду</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
