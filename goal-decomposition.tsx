"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { SubGoal } from "@/lib/supabase"

interface SubGoalData extends Partial<SubGoal> {
  // Используем Partial, так как у новых подцелей может не быть всех полей
}

interface GoalDecompositionProps {
  goalId: string
  goalTitle: string
  initialSubGoals?: SubGoal[]
  onSubGoalsChange?: (subGoals: SubGoalData[]) => void
}

export default function GoalDecomposition({
  goalId,
  goalTitle,
  initialSubGoals = [],
  onSubGoalsChange,
}: GoalDecompositionProps) {
  const [subGoals, setSubGoals] = useState<SubGoalData[]>(initialSubGoals)
  const [isSaving, setIsSaving] = useState(false)

  const addSubGoal = () => {
    const newSubGoal: SubGoalData = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      status: "not_started",
    }
    const updatedSubGoals = [...subGoals, newSubGoal]
    setSubGoals(updatedSubGoals)
    onSubGoalsChange?.(updatedSubGoals)
  }

  const removeSubGoal = (index: number) => {
    const updatedSubGoals = subGoals.filter((_, i) => i !== index)
    setSubGoals(updatedSubGoals)
    onSubGoalsChange?.(updatedSubGoals)
  }

  const updateSubGoal = (index: number, field: keyof SubGoalData, value: any) => {
    const updatedSubGoals = subGoals.map((sg, i) => (i === index ? { ...sg, [field]: value } : sg))
    setSubGoals(updatedSubGoals)
    onSubGoalsChange?.(updatedSubGoals)
  }

  const saveSubGoals = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/goals/${goalId}/subgoals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subgoals: subGoals }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Не удалось сохранить подцели")
      }

      const data = await response.json()
      setSubGoals(data.subgoals)
      onSubGoalsChange?.(data.subgoals)

      toast({
        title: "Успешно",
        description: "Подцели были сохранены.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Произошла неизвестная ошибка."
      toast({
        title: "Ошибка сохранения",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Декомпозиция цели</CardTitle>
        <CardDescription>Разбейте вашу главную цель на более мелкие и управляемые шаги.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={addSubGoal} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Добавить шаг
          </Button>
          <Button onClick={saveSubGoals} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить
          </Button>
        </div>

        <div className="space-y-4">
          {subGoals.map((subGoal, index) => (
            <div key={subGoal.id || index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <Input
                  value={subGoal.title || ""}
                  onChange={(e) => updateSubGoal(index, "title", e.target.value)}
                  placeholder="Название шага"
                  className="text-md font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
                />
                <Button onClick={() => removeSubGoal(index)} variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <Textarea
                value={subGoal.description || ""}
                onChange={(e) => updateSubGoal(index, "description", e.target.value)}
                placeholder="Описание (необязательно)"
                rows={2}
              />
              <div>
                <Label>Статус</Label>
                <select
                  value={subGoal.status || "not_started"}
                  onChange={(e) => updateSubGoal(index, "status", e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="not_started">Не начато</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершено</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
