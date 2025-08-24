"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Calendar, ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface ProfileClientProps {
  user: any
  profile: any
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    goals_focus: profile?.goals_focus || "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        goals_focus: formData.goals_focus,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Успех!",
        description: "Профиль успешно обновлен",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
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
              <User className="h-8 w-8 text-primary" />
              Мой профиль
            </h1>
            <p className="text-muted-foreground">Управляйте своей личной информацией</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
              <CardDescription>Основные данные вашего аккаунта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">{formData.full_name || "Не указано"}</p>
                  <p className="text-sm text-muted-foreground">Полное имя</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Email адрес</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString("ru-RU")}</p>
                  <p className="text-sm text-muted-foreground">Дата регистрации</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Редактировать профиль</CardTitle>
              <CardDescription>Обновите свою личную информацию</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Введите ваше полное имя"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Расскажите немного о себе, ваших интересах и целях"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="goals_focus">Основные области развития</Label>
                  <Textarea
                    id="goals_focus"
                    value={formData.goals_focus}
                    onChange={(e) => setFormData({ ...formData, goals_focus: e.target.value })}
                    placeholder="Например: карьера, здоровье, личностный рост, отношения"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Настройки аккаунта</CardTitle>
            <CardDescription>Дополнительные опции управления аккаунтом</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Уведомления по email</h4>
                  <p className="text-sm text-muted-foreground">Получать уведомления о прогрессе и напоминания</p>
                </div>
                <Button variant="outline" size="sm">
                  Настроить
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Экспорт данных</h4>
                  <p className="text-sm text-muted-foreground">Скачать все ваши данные в формате JSON</p>
                </div>
                <Button variant="outline" size="sm">
                  Экспорт
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-800">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400">Удалить аккаунт</h4>
                  <p className="text-sm text-muted-foreground">Безвозвратно удалить аккаунт и все данные</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
