"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Plus, Calendar, Play, Pause, CheckCircle, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: string
  title: string
  description: string
  status: "not_started" | "in_progress" | "completed" | "paused"
  priority: "low" | "medium" | "high"
  due_date: string
  created_at: string
  user_id: string
}

interface GoalsClientProps {
  user: any
  initialGoals: Goal[]
}

export default function GoalsClient({ user, initialGoals }: GoalsClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  })

  const supabase = createClient()
  const { toast } = useToast()

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Название цели обязательно",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            title: newGoal.title,
            description: newGoal.description,
            priority: newGoal.priority,
            due_date: newGoal.due_date,
            status: "not_started",
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setGoals([data, ...goals])
      setNewGoal({ title: "", description: "", priority: "medium", due_date: "" })
      setIsCreateDialogOpen(false)

      toast({
        title: "Успех!",
        description: "Цель успешно создана",
      })
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать цель",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: Goal["status"]) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("goals").update({ status: newStatus }).eq("id", goalId)

      if (error) throw error

      setGoals(goals.map((goal) => (goal.id === goalId ? { ...goal, status: newStatus } : goal)))

      toast({
        title: "Успех!",
        description: "Статус цели обновлен",
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId)

      if (error) throw error

      setGoals(goals.filter((goal) => goal.id !== goalId))

      toast({
        title: "Успех!",
        description: "Цель удалена",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить цель",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Goal["status"]) => {
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

  const getStatusText = (status: Goal["status"]) => {
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

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getPriorityText = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return "Высокий"
      case "medium":
        return "Средний"
      default:
        return "Низкий"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Мои цели</span>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать цель
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новую цель</DialogTitle>
                  <DialogDescription>Определите свою цель и начните путь к успеху</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название цели</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="Например: Изучить новый язык"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Подробное описание цели..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}
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
                  <div>
                    <Label htmlFor="due_date">Срок выполнения</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newGoal.due_date}
                      onChange={(e) => setNewGoal({ ...newGoal, due_date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateGoal} disabled={isLoading} className="w-full">
                    {isLoading ? "Создание..." : "Создать цель"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Пока нет целей</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Создайте свою первую цель, чтобы начать путь к успеху
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую цель
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-2">{goal.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(goal.status)}>{getStatusText(goal.status)}</Badge>
                      <Badge className={getPriorityColor(goal.priority)}>{getPriorityText(goal.priority)}</Badge>
                    </div>

                    {goal.due_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>До: {new Date(goal.due_date).toLocaleDateString("ru-RU")}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {goal.status === "not_started" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(goal.id, "in_progress")}
                          disabled={isLoading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Начать
                        </Button>
                      )}
                      {goal.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(goal.id, "completed")}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Завершить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(goal.id, "paused")}
                            disabled={isLoading}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Пауза
                          </Button>
                        </>
                      )}
                      {goal.status === "paused" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(goal.id, "in_progress")}
                          disabled={isLoading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Продолжить
                        </Button>
                      )}
                      {goal.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(goal.id, "in_progress")}
                          disabled={isLoading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Возобновить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
