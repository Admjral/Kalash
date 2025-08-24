"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GoalFormProps {
  onSubmit: (goal: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function GoalForm({ onSubmit, onCancel, isLoading = false }: GoalFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [deadline, setDeadline] = useState<Date>()
  const [priority, setPriority] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    const goalData = {
      title: title.trim(),
      description: description.trim() || null,
      category: category || null,
      deadline: deadline?.toISOString() || null,
      priority: priority || "medium",
      progress: 0,
      status: "active",
    }

    console.log("Submitting goal data:", goalData)
    await onSubmit(goalData)
  }

  const handleCancel = () => {
    if (title.trim() || description.trim()) {
      setShowConfirmDialog(true)
    } else {
      onCancel()
    }
  }

  const confirmCancel = () => {
    setShowConfirmDialog(false)
    onCancel()
  }

  const isFormValid = title.trim().length > 0

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Название цели *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Улучшить концентрацию внимания"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите подробнее, что вы хотите достичь и почему это важно для вас"
            rows={4}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emotional">Эмоциональный интеллект</SelectItem>
                <SelectItem value="focus">Концентрация и внимание</SelectItem>
                <SelectItem value="stress">Стресс-менеджмент</SelectItem>
                <SelectItem value="communication">Коммуникация</SelectItem>
                <SelectItem value="leadership">Лидерство</SelectItem>
                <SelectItem value="creativity">Креативность</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Приоритет</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Дедлайн</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-transparent"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading || !isFormValid} className="flex-1">
            {isLoading ? "Создание..." : "Создать цель"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-transparent"
            disabled={isLoading}
          >
            Отмена
          </Button>
        </div>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent aria-describedby="cancel-confirmation-desc">
          <DialogHeader>
            <DialogTitle>Подтвердите отмену</DialogTitle>
            <DialogDescription id="cancel-confirmation-desc">
              У вас есть несохраненные изменения. Вы уверены, что хотите отменить создание цели?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
              Продолжить редактирование
            </Button>
            <Button variant="destructive" onClick={confirmCancel} className="flex-1">
              Да, отменить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
