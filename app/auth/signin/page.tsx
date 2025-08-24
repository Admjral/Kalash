"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { db } from "@/lib/local-storage"
import AuthGuard from "@/components/auth-guard"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Валидация
      if (!formData.email.trim()) {
        throw new Error("Введите email")
      }

      if (!formData.password.trim()) {
        throw new Error("Введите пароль")
      }

      // Проверяем, существует ли пользователь
      const existingUser = db.getUserByEmail(formData.email)
      if (!existingUser) {
        throw new Error("Аккаунт с таким email не найден")
      }

      // Проверяем пароль
      const user = db.verifyPassword(formData.email, formData.password)
      if (!user) {
        throw new Error("Неверный пароль")
      }

      // Устанавливаем текущего пользователя
      db.setCurrentUser(user.id)

      // Устанавливаем cookie для middleware
      document.cookie = "neurocoach_authenticated=true; path=/"

      // Перенаправляем на дашборд
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      // Входим в демо-аккаунт
      const user = db.verifyPassword("demo@neurocoach.com", "demo123")
      if (user) {
        db.setCurrentUser(user.id)
        document.cookie = "neurocoach_authenticated=true; path=/"
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Ошибка входа в демо-аккаунт")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Кнопка возврата */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Вернуться на главную
              </Button>
            </Link>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold gradient-text">Добро пожаловать</CardTitle>
              <CardDescription className="text-base">Войдите в свой аккаунт NeuroCoach</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 gradient-button text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </form>

              {/* Демо-кнопка */}
              <div className="mt-4">
                <Button
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full h-11 text-base font-medium bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
                  disabled={isLoading}
                >
                  Попробовать демо
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Нет аккаунта?{" "}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                    Зарегистрироваться
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <style jsx>{`
          .gradient-text {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .gradient-button {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border: none;
            transition: all 0.3s ease;
          }
          .gradient-button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </div>
    </AuthGuard>
  )
}
