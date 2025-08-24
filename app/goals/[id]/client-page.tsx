"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, Calendar, TrendingUp, ArrowLeft, Plus, CheckCircle, Brain } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { db, type Goal } from "@/lib/local-storage"
import { toast } from "sonner"

interface Subgoal {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export default function GoalDetailClientPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [subgoals, setSubgoals] = useState<Subgoal[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newSubgoal, setNewSubgoal] = useState("")
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    target_date: "",
    status: "active" as const,
  })
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    loadGoalData()
  }, [goalId])

  const loadGoalData = async () => {
    try {
      const user = db.getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const goalData = db.getGoal(goalId)
      if (!goalData || goalData.user_id !== user) {
        router.push("/goals")
        return
      }

      setGoal(goalData)
      setEditForm({
        title: goalData.title,
        description: goalData.description,
        target_date: goalData.target_date.split("T")[0],
        status: goalData.status,
      })

      // Загружаем подцели из localStorage
      const savedSubgoals = localStorage.getItem(`subgoals_${goalId}`)
      if (savedSubgoals) {
        setSubgoals(JSON.parse(savedSubgoals))
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading goal:", error)
      setLoading(false)
    }
  }

  const handleSaveGoal = async () => {
    try {
      if (!goal) return

      const updatedGoal = db.updateGoal(goalId, {
        title: editForm.title,
        description: editForm.description,
        target_date: editForm.target_date,
        status: editForm.status,
      })

      if (updatedGoal) {
        setGoal(updatedGoal)
        setEditing(false)
        toast.success("Цель успешно обновлена!")
      }
    } catch (error) {
      console.error("Error updating goal:", error)
      toast.error("Ошибка при сохранении цели")
    }
  }

  const handleUpdateProgress = (newProgress: number) => {
    if (!goal) return

    const updatedGoal = db.updateGoal(goalId, { progress: newProgress })
    if (updatedGoal) {
      setGoal(updatedGoal)

      // Проверяем достижения
      const user = db.getCurrentUser()
      if (user && newProgress === 100 && goal.progress < 100) {
        db.updateGoal(goalId, { status: "completed" })
        db.createAchievement({
          user_id: user,
          title: "Цель достигнута!",
          description: `Завершили цель: ${updatedGoal.title}`,
          icon: "✅",
        })
        setGoal((prev) => (prev ? { ...prev, status: "completed" } : null))
        toast.success("🎉 Поздравляем! Цель достигнута!")
      }
    }
  }

  const handleAddSubgoal = () => {
    if (!newSubgoal.trim()) return

    const subgoal: Subgoal = {
      id: Date.now().toString(),
      title: newSubgoal.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    }

    const updatedSubgoals = [...subgoals, subgoal]
    setSubgoals(updatedSubgoals)
    localStorage.setItem(`subgoals_${goalId}`, JSON.stringify(updatedSubgoals))
    setNewSubgoal("")
    toast.success("Подцель добавлена!")
  }

  const handleToggleSubgoal = (subgoalId: string) => {
    const updatedSubgoals = subgoals.map((sg) => (sg.id === subgoalId ? { ...sg, completed: !sg.completed } : sg))
    setSubgoals(updatedSubgoals)
    localStorage.setItem(`subgoals_${goalId}`, JSON.stringify(updatedSubgoals))

    // Автоматически обновляем прогресс основной цели
    const completedCount = updatedSubgoals.filter((sg) => sg.completed).length
    const totalCount = updatedSubgoals.length
    if (totalCount > 0) {
      const newProgress = Math.round((completedCount / totalCount) * 100)
      handleUpdateProgress(newProgress)
    }
  }

  const handleDeleteSubgoal = (subgoalId: string) => {
    const updatedSubgoals = subgoals.filter((sg) => sg.id !== subgoalId)
    setSubgoals(updatedSubgoals)
    localStorage.setItem(`subgoals_${goalId}`, JSON.stringify(updatedSubgoals))
    toast.success("Подцель удалена")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white"
      case "active":
        return "bg-blue-500 text-white"
      case "paused":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершена"
      case "active":
        return "Активна"
      case "paused":
        return "Приостановлена"
      default:
        return "Неизвестно"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Цель не найдена</h3>
            <p className="text-gray-600 mb-4">Возможно, цель была удалена или у вас нет доступа к ней</p>
            <Button asChild>
              <Link href="/goals">Вернуться к целям</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedSubgoals = subgoals.filter((sg) => sg.completed).length
  const daysUntilTarget = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к целям
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{goal.title}</h1>
          <p className="text-muted-foreground">Детали и управление целью</p>
        </div>
        <Badge className={getStatusColor(goal.status)}>{getStatusText(goal.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Информация о цели</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Описание</h3>
                  <p className="text-gray-700">{goal.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Создана</h4>
                    <p>{new Date(goal.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Целевая дата</h4>
                    <p>{new Date(goal.target_date).toLocaleDateString("ru-RU")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Подцели */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Подцели
              </CardTitle>
              <CardDescription>Разбейте цель на более мелкие задачи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSubgoal}
                  onChange={(e) => setNewSubgoal(e.target.value)}
                  placeholder="Добавить новую подцель..."
                  onKeyPress={(e) => e.key === "Enter" && handleAddSubgoal()}
                />
                <Button onClick={handleAddSubgoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {subgoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Пока нет подцелей</p>
                  <p className="text-sm">Добавьте подцели для лучшего планирования</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subgoals.map((subgoal) => (
                    <div key={subgoal.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <button
                        onClick={() => handleToggleSubgoal(subgoal.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          subgoal.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {subgoal.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <span className={`flex-1 ${subgoal.completed ? "line-through text-gray-500" : ""}`}>
                        {subgoal.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubgoal(subgoal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {subgoals.length > 0 && (
                <div className="text-sm text-gray-600">
                  Выполнено: {completedSubgoals} из {subgoals.length} подцелей
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Прогресс */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Прогресс
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{goal.progress}%</div>
                <Progress value={goal.progress} className="h-3" />
              </div>

              {goal.status === "active" && (
                <div className="space-y-2">
                  <Label>Обновить прогресс</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant={goal.progress >= value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateProgress(value)}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Дней до цели:</span>
                <span
                  className={`text-sm font-medium ${daysUntilTarget < 0 ? "text-red-600" : daysUntilTarget < 7 ? "text-yellow-600" : "text-green-600"}`}
                >
                  {daysUntilTarget < 0 ? `Просрочено на ${Math.abs(daysUntilTarget)} дн.` : `${daysUntilTarget} дн.`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Подцелей:</span>
                <span className="text-sm font-medium">{subgoals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Выполнено:</span>
                <span className="text-sm font-medium text-green-600">{completedSubgoals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Создана:</span>
                <span className="text-sm font-medium">{new Date(goal.created_at).toLocaleDateString("ru-RU")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/coach">
                  <Brain className="mr-2 h-4 w-4" />
                  Коуч-сессия по цели
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/analytics">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Аналитика прогресса
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
