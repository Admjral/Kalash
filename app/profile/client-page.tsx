"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, Edit, Save, X, Target, Award, Brain, TrendingUp, AlertCircle, Home } from "lucide-react"
import { db, type Profile, type User as UserType } from "@/lib/local-storage"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ProfileClientPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    achievements: 0,
    sessions: 0,
    averageProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const router = useRouter()

  // Форма редактирования - инициализируем с пустыми строками
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUserId = db.getCurrentUser()
      if (!currentUserId) {
        setError("Пользователь не авторизован")
        return
      }

      // Загружаем пользователя
      const userData = db.getUserById(currentUserId)
      if (!userData) {
        setError("Пользователь не найден")
        return
      }
      setUser(userData)

      // Загружаем профиль
      const profileData = db.getProfileByUserId(currentUserId)
      if (!profileData) {
        // Создаем профиль если его нет
        const newProfile = db.createProfile(currentUserId, userData.name, userData.email)
        setProfile(newProfile)
        // Устанавливаем форму после создания профиля
        setEditForm({
          name: newProfile.name || "",
          bio: newProfile.bio || "",
        })
      } else {
        setProfile(profileData)
        // Устанавливаем форму с данными профиля
        setEditForm({
          name: profileData.name || "",
          bio: profileData.bio || "",
        })
      }

      // Загружаем статистику
      const goals = db.getGoals(currentUserId)
      const sessions = db.getSessions(currentUserId)
      const userAchievements = db.getAchievements(currentUserId)
      setAchievements(userAchievements)

      const activeGoals = goals.filter((g) => g.status === "active")
      const completedGoals = goals.filter((g) => g.status === "completed")
      const averageProgress =
        activeGoals.length > 0
          ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
          : 0

      setStats({
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        achievements: userAchievements.length,
        sessions: sessions.length,
        averageProgress,
      })
    } catch (err: any) {
      console.error("Profile error:", err)
      setError(err.message || "Ошибка загрузки профиля")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setSaving(true)

      const updatedProfile = db.updateProfile(profile.userId, {
        name: editForm.name,
        bio: editForm.bio,
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        setEditing(false)
        toast.success("Профиль успешно обновлен!")
      } else {
        toast.error("Ошибка обновления профиля")
      }
    } catch (err: any) {
      console.error("Save profile error:", err)
      toast.error("Ошибка сохранения профиля")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        bio: profile.bio || "",
      })
    }
    setEditing(false)
  }

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Пожалуйста, заполните все поля")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Новые пароли не совпадают")
      return
    }

    try {
      // Здесь была бы реальная логика смены пароля
      // Для демо просто показываем успешное сообщение
      toast.success("Пароль успешно изменен!")
      setShowPasswordChange(false)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error("Ошибка при смене пароля")
    }
  }

  const handleDeleteAccount = () => {
    try {
      const userId = db.getCurrentUser()
      if (!userId) return

      // Удаляем пользователя и все связанные данные
      // В реальном приложении здесь был бы API вызов
      db.logout()
      toast.success("Аккаунт успешно удален")
      router.push("/auth/signin")
    } catch (error) {
      toast.error("Ошибка при удалении аккаунта")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadProfileData}>Попробовать снова</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Профиль не найден</h3>
              <p className="text-gray-600">Не удалось загрузить данные профиля</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              На дашборд
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Управляйте своими личными данными</CardDescription>
              </div>
              {!editing ? (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Участник с {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Полное имя</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Расскажите о себе..."
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Полное имя</Label>
                    <p className="text-gray-900 mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <Label>О себе</Label>
                    <p className="text-gray-900 mt-1">{profile.bio || "Информация не указана"}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-gray-900 mt-1">{profile.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Моя статистика</CardTitle>
              <CardDescription>Обзор вашей активности на платформе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{stats.totalGoals}</div>
                  <div className="text-sm text-blue-700">Всего целей</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{stats.activeGoals}</div>
                  <div className="text-sm text-green-700">Активных</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{stats.achievements}</div>
                  <div className="text-sm text-purple-700">Достижений</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Brain className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{stats.sessions}</div>
                  <div className="text-sm text-orange-700">Сессий</div>
                </div>

                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-900">{stats.averageProgress}%</div>
                  <div className="text-sm text-indigo-700">Ср. прогресс</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.completedGoals}</div>
                  <div className="text-sm text-gray-700">Завершено</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Последние достижения */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Последние достижения</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(-3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Пока нет достижений</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Информация о НейроКоуче */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">О НейроКоуче</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold text-blue-900 mb-2">Ваш персональный ИИ-коуч</h3>
                <p className="text-sm text-blue-700">
                  Использует передовые технологии искусственного интеллекта для персонализированного коучинга
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Доступен 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Адаптируется под ваши цели</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Помогает достигать результатов</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Настройки аккаунта */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Настройки аккаунта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showPasswordChange ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Изменение пароля</h3>
                  <div>
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleChangePassword}>Сохранить</Button>
                    <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => setShowPasswordChange(true)}
                >
                  Изменить пароль
                </Button>
              )}

              {showDeleteConfirm ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-700 mb-2">Вы уверены?</h3>
                  <p className="text-sm text-red-600 mb-3">
                    Это действие нельзя отменить. Все ваши данные будут удалены.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Да, удалить аккаунт
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Удалить аккаунт
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
