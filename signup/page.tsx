"use client"

import { useState, useTransition } from "react"
import { signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain } from 'lucide-react'
import Link from "next/link"

export default function SignupPage() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ error?: string; success?: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signup(null, formData)
      setState(result)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">NeuroCoach</span>
          </div>
          <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
          <CardDescription>Начните свой путь к личностному росту</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Иван Петров"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                disabled={isPending}
              />
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state?.success && (
              <Alert>
                <AlertDescription className="text-green-600">
                  {state.success}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание аккаунта...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
