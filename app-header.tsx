"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, LogOut, User, Settings, Bell, Search } from "lucide-react"
import { MobileNav } from "./mobile-nav"

interface AppHeaderProps {
  user: Profile | null
  showSearch?: boolean
  showNotifications?: boolean
}

// ИСПРАВЛЕНО: Возвращен именованный экспорт `export function`
export function AppHeader({ user, showSearch = false, showNotifications = false }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Дашборд"
    if (pathname.startsWith("/coach")) return "ИИ Коуч"
    if (pathname.startsWith("/goals")) return "Цели"
    if (pathname.startsWith("/analytics")) return "Аналитика"
    if (pathname.startsWith("/assessments")) return "Оценки"
    if (pathname.startsWith("/profile")) return "Профиль"
    return "NeuroCoach"
  }

  const isInSession = pathname.includes("/coach/session")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MobileNav user={user} />

        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 mr-6">
          <Brain className="h-6 w-6 text-blue-600" />
          <span className="hidden sm:inline-block text-xl font-bold text-gray-900">NeuroCoach</span>
        </Link>

        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          {isInSession && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Активная сессия
            </Badge>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6 mr-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Дашборд
          </Link>
          <Link
            href="/coach"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/coach") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            ИИ Коуч
          </Link>
          <Link
            href="/goals"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/goals") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Цели
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
              <span className="sr-only">Поиск</span>
            </Button>
          )}

          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              <span className="sr-only">Уведомления</span>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                      {user.full_name ? getInitials(user.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Начать</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
