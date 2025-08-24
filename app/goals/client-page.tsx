"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Plus, Calendar, TrendingUp, Trash2, CheckCircle, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { db, type Goal } from "@/lib/local-storage"
import { toast } from "sonner"

export default function GoalsClientPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Общее",
    priority: "medium" as const,
    targetDate: "",
  })
  const router = useRouter()

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const currentUserId = db.getCurrentUser()
      if (!currentUserId) {
        router.push("/auth/signin")
        return
      }

      const userGoals = db.getGoals(currentUserId)
      setGoals(userGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setLoading(false)
    } catch (error) {
      console.error("Error loading goals:", error)
      toast.error("Ошибка загрузки целей")
      setLoading(false)
    }
  }

  const handleCreateGoal = async () => {
    try {
      const currentUserId = db.getCurrentUser()
      if (!currentUserId) return

      if (!newGoal.title.trim() || !newGoal.description.trim()) {
        toast.error("Пожалуйста, заполните все поля")
        return
      }

      const goal = db.createGoal(currentUserId, {
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        category: newGoal.category,
        priority: newGoal.priority,
        status: "active",
        progress: 0,
        targetDate: newGoal.targetDate === "skip" ? "пропущено" : newGoal.targetDate,
      })

      // Создаем достижение за создание цели
      const userGoals = db.getGoals(currentUserId)
      if (userGoals.length === 1) {
        db.createAchievement(currentUserId, {
          title: "Первая цель",
          description: "Создали свою первую цель",
          icon: "🎯",
        })
        toast.success("Поздравляем! Вы получили достижение: Первая цель 🎯")
      } else if (userGoals.length === 5) {
        db.createAchievement(currentUserId, {
          title: "Целеустремленный",
          description: "Создали 5 целей",
          icon: "🏆",
        })
        toast.success("Поздравляем! Вы получили достижение: Целеустремленный 🏆")
      }

      setGoals((prev) => [goal, ...prev])
      setNewGoal({ title: "", description: "", category: "Общее", priority: "medium", targetDate: "" })
      setIsCreateDialogOpen(false)
      toast.success("Цель успешно создана!")
    } catch (error) {
      console.error("Error creating goal:", error)
      toast.error("Ошибка при создании цели")
    }
  }

  const handleUpdateProgress = (goalId: string, newProgress: number) => {
    const updatedGoal = db.updateGoal(goalId, { progress: newProgress })
    if (updatedGoal) {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)))

      // Проверяем достижения
      const currentUserId = db.getCurrentUser()
      if (currentUserId && newProgress === 100) {
        db.updateGoal(goalId, { status: "completed" })
        db.createAchievement(currentUserId, {
          title: "Цель достигнута!",
          description: `Завершили цель: ${updatedGoal.title}`,
          icon: "✅",
        })
        toast.success(`Поздравляем! Цель "${updatedGoal.title}" завершена! ✅`)
        loadGoals() // Перезагружаем для обновления статуса
      } else {
        toast.success(`Прогресс обновлен: ${newProgress}%`)
      }
    }
  }

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту цель?")) {
      db.deleteGoal(goalId)
      setGoals((prev) => prev.filter((g) => g.id !== goalId))
      toast.success("Цель удалена")
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Высокий"
      case "medium":
        return "Средний"
      case "low":
        return "Низкий"
      default:
        return "Средний"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const pausedGoals = goals.filter((g) => g.status === "paused")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои цели</h1>
          <p className="text-muted-foreground">Управляйте своими целями и отслеживайте прогресс</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              На дашборд
            </Link>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Новая цель
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую цель</DialogTitle>
                <DialogDescription>Определите свою цель и начните путь к её достижению</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название цели</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Например: Изучить новый язык"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Подробно опишите вашу цель..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Общее">Общее</SelectItem>
                        <SelectItem value="Образование">Образование</SelectItem>
                        <SelectItem value="Карьера">Карьера</SelectItem>
                        <SelectItem value="Здоровье">Здоровье</SelectItem>
                        <SelectItem value="Отношения">Отношения</SelectItem>
                        <SelectItem value="Финансы">Финансы</SelectItem>
                        <SelectItem value="Личностный рост">Личностный рост</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setNewGoal((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="targetDate">Целевая дата</Label>
                  <div className="flex gap-2">
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, targetDate: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewGoal((prev) => ({ ...prev, targetDate: "skip" }))}
                    >
                      Пропустить
                    </Button>
                  </div>
                  {newGoal.targetDate === "skip" && (
                    <p className="text-xs text-gray-500 mt-1">Целевая дата будет пропущена</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateGoal} className="flex-1">
                    Создать цель
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершенные</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список целей */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Пока нет целей</h3>
            <p className="text-gray-600 mb-4">Создайте свою первую цель, чтобы начать путь к успеху</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первую цель
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{goal.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(goal.status)}>{getStatusText(goal.status)}</Badge>
                    <Badge variant={getPriorityColor(goal.priority)}>{getPriorityText(goal.priority)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Прогресс</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {goal.status === "active" && (
                  <div className="flex gap-1">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant={goal.progress >= value ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleUpdateProgress(goal.id, value)}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    До {new Date(goal.targetDate).toLocaleDateString("ru-RU")}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
