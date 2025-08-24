"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Trash2, PlusCircle, Sparkles, Loader2 } from "lucide-react"
import type { GoalWithSubGoals } from "@/lib/supabase"

const subGoalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Название должно быть не менее 3 символов"),
  description: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]),
})

const goalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Название цели должно быть не менее 3 символов"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold", "archived"]),
  subgoals: z.array(subGoalSchema),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalClientPageProps {
  initialGoal: GoalWithSubGoals | null
  error: string | null
}

export default function GoalDetailClientPage({ initialGoal, error: initialError }: GoalClientPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDecomposing, setIsDecomposing] = useState(false)

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      id: initialGoal?.id || undefined,
      title: initialGoal?.title || "",
      description: initialGoal?.description || "",
      status: initialGoal?.status || "active",
      subgoals: initialGoal?.subgoals || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subgoals",
  })

  const onSubmit = async (values: GoalFormData) => {
    startTransition(async () => {
      const url = values.id ? `/api/goals/${values.id}` : "/api/goals"
      const method = values.id ? "PUT" : "POST"

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error("Не удалось сохранить цель")
        }

        const savedGoal = await response.json()
        toast.success("Цель успешно сохранена!")

        if (!values.id) {
          router.push(`/goals/${savedGoal.id}`)
        } else {
          router.refresh()
        }
      } catch (error) {
        toast.error((error as Error).message)
      }
    })
  }

  const handleDecomposition = async () => {
    const title = form.getValues("title")
    if (!title) {
      toast.error("Сначала введите название цели.")
      return
    }
    setIsDecomposing(true)
    try {
      const response = await fetch("/api/ai-goal-decomposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalTitle: title }),
      })
      if (!response.ok) throw new Error("Ошибка при декомпозиции цели")
      const { subGoals: decomposedSubgoals } = await response.json()

      // Очищаем старые и добавляем новые
      remove()
      decomposedSubgoals.forEach((sg: { title: string; description: string }) => {
        append({
          title: sg.title,
          description: sg.description,
          status: "not_started",
        })
      })

      toast.success("Цель успешно разложена на подцели!")
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsDecomposing(false)
    }
  }

  if (initialError) {
    return (
      <Card className="m-4 md:m-8">
        <CardHeader>
          <CardTitle className="text-destructive">Ошибка</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{initialError}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{initialGoal ? "Редактирование цели" : "Создание новой цели"}</CardTitle>
          <CardDescription>
            {initialGoal
              ? "Измените детали вашей цели и ее подцелей."
              : "Опишите вашу новую цель, и мы поможем ее достичь."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название цели</FormLabel>
                      <FormControl>
                        <Input placeholder="Например, выучить испанский язык" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Активна</SelectItem>
                          <SelectItem value="completed">Завершена</SelectItem>
                          <SelectItem value="on_hold">На паузе</SelectItem>
                          <SelectItem value="archived">Архивирована</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Опишите, почему эта цель важна для вас" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Подцели</h3>
                  <Button type="button" variant="outline" onClick={handleDecomposition} disabled={isDecomposing}>
                    {isDecomposing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Разбить с помощью ИИ
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <FormItem className="md:col-span-2">
                          <FormLabel>Название подцели</FormLabel>
                          <FormControl>
                            <Input {...form.register(`subgoals.${index}.title`)} />
                          </FormControl>
                        </FormItem>
                        <FormItem className="md:col-span-2">
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <Input {...form.register(`subgoals.${index}.description`)} />
                          </FormControl>
                        </FormItem>
                        <Controller
                          control={form.control}
                          name={`subgoals.${index}.status`}
                          render={({ field: controllerField }) => (
                            <FormItem>
                              <FormLabel>Статус</FormLabel>
                              <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="not_started">Не начата</SelectItem>
                                  <SelectItem value="in_progress">В процессе</SelectItem>
                                  <SelectItem value="completed">Завершена</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => append({ title: "", status: "not_started" })}
                  className="mt-4"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить подцель вручную
                </Button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialGoal ? "Сохранить изменения" : "Создать цель"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
