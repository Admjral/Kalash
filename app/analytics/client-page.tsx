"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home } from "lucide-react"
import { TrendingUp, Target, Award, Brain, BarChart3, PieChart, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { db, type Goal, type CoachingSession, type Achievement } from "@/lib/local-storage"

export default function AnalyticsClientPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const user = db.getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const userGoals = db.getGoals(user)
      const userSessions = db.getSessions(user)
      const userAchievements = db.getAchievements(user)
      const userAnalytics = db.getAnalytics(user)

      setGoals(userGoals)
      setSessions(userSessions)
      setAchievements(userAchievements)
      setAnalytics(userAnalytics)

      // Симулируем загрузку
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoading(false)
    } catch (error) {
      console.error("Error loading analytics:", error)
      setLoading(false)
    }
  }

  const getProgressDistribution = () => {
    const ranges = [
      { label: "0-25%", min: 0, max: 25, color: "bg-red-500" },
      { label: "26-50%", min: 26, max: 50, color: "bg-yellow-500" },
      { label: "51-75%", min: 51, max: 75, color: "bg-blue-500" },
      { label: "76-100%", min: 76, max: 100, color: "bg-green-500" },
    ]

    return ranges.map((range) => ({
      ...range,
      count: goals.filter((g) => g.progress >= range.min && g.progress <= range.max).length,
    }))
  }

  const getMonthlyProgress = () => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthGoals = goals.filter((g) => {
        const goalDate = new Date(g.created_at)
        return goalDate.getMonth() === date.getMonth() && goalDate.getFullYear() === date.getFullYear()
      })

      months.push({
        month: date.toLocaleDateString("ru-RU", { month: "short" }),
        goals: monthGoals.length,
        completed: monthGoals.filter((g) => g.status === "completed").length,
      })
    }

    return months
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const progressDistribution = getProgressDistribution()
  const monthlyProgress = getMonthlyProgress()
  const totalGoals = analytics?.totalGoals || 0
  const completionRate = totalGoals > 0 ? Math.round((analytics?.completedGoals / totalGoals) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground">Подробная статистика вашего прогресса</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            На дашборд
          </Link>
        </Button>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего целей</p>
                <p className="text-2xl font-bold">{analytics?.totalGoals || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершено</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.completedGoals || 0}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Коуч-сессии</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.totalSessions || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Процент завершения</p>
                <p className="text-2xl font-bold text-orange-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">Цели</TabsTrigger>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
          <TabsTrigger value="sessions">Сессии</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Распределение по прогрессу */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Распределение по прогрессу
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressDistribution.map((range, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{range.label}</span>
                      <span className="text-sm text-gray-600">{range.count} целей</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${range.color}`}
                        style={{ width: `${totalGoals > 0 ? (range.count / totalGoals) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Активные цели */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Активные цели
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goals
                  .filter((g) => g.status === "active")
                  .slice(0, 5)
                  .map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium truncate">{goal.title}</span>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1" />
                    </div>
                  ))}
                {goals.filter((g) => g.status === "active").length === 0 && (
                  <p className="text-center text-gray-500 py-4">Нет активных целей</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Месячная статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Динамика по месяцам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {monthlyProgress.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <div className="h-20 bg-gray-200 rounded relative overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full bg-blue-500 transition-all"
                          style={{
                            height: `${month.goals > 0 ? (month.goals / Math.max(...monthlyProgress.map((m) => m.goals))) * 100 : 0}%`,
                          }}
                        ></div>
                        <div
                          className="absolute bottom-0 w-full bg-green-500 transition-all"
                          style={{
                            height: `${month.goals > 0 ? (month.completed / Math.max(...monthlyProgress.map((m) => m.goals))) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{month.month}</div>
                    <div className="text-sm font-medium">{month.goals}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Всего целей</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Завершено</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Средний прогресс</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{analytics?.avgProgress || 0}%</div>
                  <Progress value={analytics?.avgProgress || 0} className="h-3" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Активные цели:</span>
                    <span>{analytics?.activeGoals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Завершенные цели:</span>
                    <span>{analytics?.completedGoals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Процент завершения:</span>
                    <span>{completionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ближайшие дедлайны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals
                    .filter((g) => g.status === "active")
                    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
                    .slice(0, 5)
                    .map((goal) => {
                      const daysLeft = Math.ceil(
                        (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                      )
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{goal.title}</p>
                            <p className="text-xs text-gray-600">{goal.progress}% завершено</p>
                          </div>
                          <Badge variant={daysLeft < 0 ? "destructive" : daysLeft < 7 ? "secondary" : "outline"}>
                            {daysLeft < 0 ? `Просрочено` : `${daysLeft} дн.`}
                          </Badge>
                        </div>
                      )
                    })}
                  {goals.filter((g) => g.status === "active").length === 0 && (
                    <p className="text-center text-gray-500 py-4">Нет активных целей</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика сессий</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">{analytics?.totalSessions || 0}</div>
                    <div className="text-sm text-gray-600">Всего сессий</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-yellow-600">{analytics?.avgRating || 0}</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                  </div>
                </div>

                {sessions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Распределение рейтингов</h4>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = sessions.filter((s) => s.rating === rating).length
                      const percentage = sessions.length > 0 ? (count / sessions.length) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center gap-2 mb-1">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Недавние сессии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions
                    .slice(-5)
                    .reverse()
                    .map((session) => (
                      <div key={session.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium capitalize">{session.session_type.replace("-", " ")}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < session.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(session.created_at).toLocaleDateString("ru-RU")}
                        </div>
                        {session.goal_id && (
                          <div className="mt-2 text-xs text-green-600">
                            Цель: {goals.find((g) => g.id === session.goal_id)?.title || "Общая сессия"}
                          </div>
                        )}
                      </div>
                    ))}
                  {sessions.length === 0 && <p className="text-center text-gray-500 py-4">Нет проведенных сессий</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Все достижения
              </CardTitle>
              <CardDescription>Всего получено: {achievements.length} достижений</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Пока нет достижений</h3>
                  <p className="text-gray-600">Достижения появятся по мере выполнения целей и активности</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(achievement.earned_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
