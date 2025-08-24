"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Calendar, Award, ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Goal {
  id: string
  title: string
  status: string
  created_at: string
  target_date?: string
}

interface AnalyticsClientProps {
  goals: Goal[]
  userId: string
}

export default function AnalyticsClient({ goals }: AnalyticsClientProps) {
  const totalGoals = goals.length
  const completedGoals = goals.filter((goal) => goal.status === "completed").length
  const inProgressGoals = goals.filter((goal) => goal.status === "in_progress").length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const getStatusStats = () => {
    const stats = {
      not_started: 0,
      in_progress: 0,
      paused: 0,
      completed: 0,
    }

    goals.forEach((goal) => {
      stats[goal.status as keyof typeof stats]++
    })

    return stats
  }

  const statusStats = getStatusStats()

  const getRecentActivity = () => {
    return goals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  }

  const recentActivity = getRecentActivity()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Аналитика прогресса
            </h1>
            <p className="text-muted-foreground">Отслеживайте свои достижения и прогресс</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего целей</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <p className="text-xs text-muted-foreground">Созданных целей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершено</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
              <p className="text-xs text-muted-foreground">Достигнутых целей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В процессе</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
              <p className="text-xs text-muted-foreground">Активных целей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Успешность</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Процент завершения</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Общий прогресс</CardTitle>
              <CardDescription>Ваши достижения в цифрах</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Завершение целей</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Завершено</span>
                  <Badge className="bg-green-100 text-green-800">{statusStats.completed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">В процессе</span>
                  <Badge className="bg-blue-100 text-blue-800">{statusStats.in_progress}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Приостановлено</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{statusStats.paused}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Не начато</span>
                  <Badge className="bg-gray-100 text-gray-800">{statusStats.not_started}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
              <CardDescription>Недавно созданные цели</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(goal.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <Badge
                        className={
                          goal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : goal.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {goal.status === "completed"
                          ? "Завершена"
                          : goal.status === "in_progress"
                            ? "В процессе"
                            : "Не начата"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Пока нет активности</p>
                  <Link href="/goals">
                    <Button className="mt-4" size="sm">
                      Создать первую цель
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Инсайты и рекомендации</CardTitle>
            <CardDescription>Персональные рекомендации на основе вашей активности</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalGoals === 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Начните с первой цели</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Создайте свою первую цель, чтобы начать отслеживать прогресс и получать персональные рекомендации.
                  </p>
                </div>
              )}

              {completionRate > 0 && completionRate < 50 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Фокус на выполнении</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Рассмотрите возможность сосредоточиться на завершении текущих целей перед созданием новых.
                  </p>
                </div>
              )}

              {completionRate >= 80 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Отличная работа!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    У вас высокий процент завершения целей. Продолжайте в том же духе и ставьте новые амбициозные цели!
                  </p>
                </div>
              )}

              {inProgressGoals > 5 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Много активных целей</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    У вас много целей в процессе. Рассмотрите приоритизацию наиболее важных из них.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
