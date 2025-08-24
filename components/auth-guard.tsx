"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/local-storage"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = db.getCurrentUser()
      const authenticated = !!currentUser

      setIsAuthenticated(authenticated)

      // Устанавливаем cookie для middleware
      if (authenticated) {
        document.cookie = "neurocoach_authenticated=true; path=/"
      } else {
        document.cookie = "neurocoach_authenticated=false; path=/"
      }

      setIsLoading(false)

      // Если требуется аутентификация, но пользователь не аутентифицирован
      if (requireAuth && !authenticated) {
        router.push("/")
        return
      }

      // Если не требуется аутентификация, но пользователь аутентифицирован
      // (например, на страницах входа/регистрации)
      if (!requireAuth && authenticated) {
        router.push("/dashboard")
        return
      }
    }

    checkAuth()
  }, [requireAuth, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    )
  }

  // Если требуется аутентификация, но пользователь не аутентифицирован
  if (requireAuth && !isAuthenticated) {
    return null // Компонент перенаправит на главную
  }

  // Если не требуется аутентификация, но пользователь аутентифицирован
  if (!requireAuth && isAuthenticated) {
    return null // Компонент перенаправит на дашборд
  }

  return <>{children}</>
}
