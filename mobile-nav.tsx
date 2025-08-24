"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Menu, Brain, Home, Target, BookOpen, Settings, LogOut, User, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase"

interface MobileNavProps {
  user: Profile | null
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push("/")
    router.refresh()
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const navItems = [
    {
      title: "Дашборд",
      href: "/dashboard",
      icon: Home,
      description: "Обзор ваших целей и прогресса",
    },
    {
      title: "ИИ Коуч",
      href: "/coach",
      icon: Brain,
      description: "Персональные сессии с коучем",
    },
    {
      title: "Цели",
      href: "/goals",
      icon: Target,
      description: "Управление вашими целями",
    },
    {
      title: "Аналитика",
      href: "/analytics",
      icon: BarChart3,
      description: "Детальная статистика прогресса",
    },
    {
      title: "Оценки",
      href: "/assessments",
      icon: BookOpen,
      description: "Психологические тесты и оценки",
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            NeuroCoach
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 py-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Separator className="my-2" />

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          <Separator className="my-2" />

          {/* Bottom Actions */}
          <div className="space-y-2 pb-4">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <User className="h-4 w-4" />
              Профиль
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
