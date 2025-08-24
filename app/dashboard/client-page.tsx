"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Award, Plus, ArrowRight, MessageSquare, BarChart3, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { db, type Goal, type CoachingSession, type Achievement, type Profile } from "@/lib/local-storage"
import { toast } from "sonner"

export default function DashboardClientPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const currentUserId = db.getCurrentUser()
        if (!currentUserId) return

        // Загружаем данные
        const userGoals = db.getGoalsByUserId(currentUserId)
        const userSessions = db.getSessions(currentUserId)
        const userAchievements = db.getAchievements(currentUserId)
        const userProfile = db.getProfileByUserId(currentUserId)

        setGoals(userGoals)
        setSessions(userSessions)
        setAchievements(userAchievements)
        setProfile(userProfile)
      } catch (error) {
        console.error("Dashboard error:", error)
        toast.error("Ошибка загрузки данных дашборда")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleLogout = () => {
    db.logout()
    toast.success("Вы успешно вышли из системы")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Статистика
  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const averageProgress =
    goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0
  const recentSessions = sessions.slice(-3)
  const averageRating =
    sessions.length > 0
      ? Math.round((sessions.reduce((sum, session) => sum + session.rating, 0) / sessions.length) * 10) / 10
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Добро пожаловать, {profile?.name || "Пользователь"}! 👋
              </h1>
              <p className="text-gray-600">Ваш прогресс в достижении целей</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/goals">
                  <Plus className="h-4 w-4 mr-2" />
                  Новая цель
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/coach">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  ИИ-коуч
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные цели</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">{completedGoals.length} завершено</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний прогресс</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <Progress value={averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Сессии коучинга</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">Средняя оценка: {averageRating}/5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Достижения</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">Разблокировано наград</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Активные цели */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Активные цели</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/goals">
                    Все цели
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">У вас пока нет активных целей</p>
                  <Button asChild>
                    <Link href="/goals">
                      <Plus className="h-4 w-4 mr-2" />
                      Создать первую цель
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{goal.title}</h3>
                        <Badge
                          variant={
                            goal.priority === "high"
                              ? "destructive"
                              : goal.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {goal.priority === "high" ? "Высокий" : goal.priority === "medium" ? "Средний" : "Низкий"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <Progress value={goal.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{goal.progress}% завершено</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Последние сессии */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Последние сессии</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/coach">
                    Новая сессия
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">У вас пока нет сессий с ИИ-коучем</p>
                  <Button asChild>
                    <Link href="/coach">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Начать первую сессию
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .slice(-3)
                    .reverse()
                    .map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < session.rating ? "bg-yellow-400" : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(session.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Достижения */}
        {achievements.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Последние достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.slice(-3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Быстрые действия */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/goals">
                  <Target className="h-6 w-6 mb-2" />
                  Управление целями
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/coach">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  ИИ-коуч
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/analytics">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Аналитика
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/profile">
                  <User className="h-6 w-6 mb-2" />
                  Профиль
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
