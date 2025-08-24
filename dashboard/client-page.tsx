"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, TrendingUp, MessageCircle, Calendar, Plus, ArrowRight, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardClientProps {
  user: any
  profile: any
  goals: any[]
}

export default function DashboardClient({ user, profile, goals }: DashboardClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      toast({
        title: "Выход выполнен",
        description: "До свидания! Увидимся снова.",
      })
      window.location.href = "/"
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGoalStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершена"
      case "in_progress":
        return "В процессе"
      case "paused":
        return "Приостановлена"
      default:
        return "Не начата"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text">NeuroCoach</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-primary font-medium">
                Дашборд
              </Link>
              <Link href="/goals" className="text-gray-600 hover:text-primary">
                Цели
              </Link>
              <Link href="/coach" className="text-gray-600 hover:text-primary">
                ИИ Коуч
              </Link>
              <Link href="/analytics" className="text-gray-600 hover:text-primary">
                Аналитика
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-primary">
                Профиль
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{profile?.full_name || user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoading}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать, {profile?.full_name || "Пользователь"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Готовы продолжить свое путешествие к личностному росту?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Link href="/goals" className="block">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Мои цели</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{goals.length} активных</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Link href="/coach" className="block">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                    <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ИИ Коуч</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Начать сессию</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Link href="/analytics" className="block">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Прогресс</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Посмотреть аналитику</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Link href="/assessments" className="block">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Оценки</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Пройти тест</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Последние цели
                </CardTitle>
                <Link href="/goals">
                  <Button variant="outline" size="sm">
                    Все цели
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                      </div>
                      <Badge className={getGoalStatusColor(goal.status)}>{getGoalStatusText(goal.status)}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Пока нет целей</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Создайте свою первую цель, чтобы начать путь к успеху
                  </p>
                  <Link href="/goals">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать цель
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрый старт</CardTitle>
              <CardDescription>Рекомендации для эффективного использования платформы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Создайте свою первую цель</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Определите, чего вы хотите достичь</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Поговорите с ИИ коучем</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Получите персональные рекомендации</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Отслеживайте прогресс</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Анализируйте свои достижения</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
