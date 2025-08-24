import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Проверяем, есть ли текущий пользователь в localStorage через cookie или header
  // Для демонстрации будем проверять через специальный header
  const isAuthenticated = request.cookies.get("neurocoach_authenticated")?.value === "true"

  // Защищенные маршруты (требуют аутентификации)
  const protectedRoutes = ["/dashboard", "/goals", "/coach", "/analytics", "/profile", "/assessments"]

  // Публичные маршруты (не требуют аутентификации)
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/demo"]

  // Если пользователь не аутентифицирован и пытается попасть на защищенный маршрут
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Если пользователь аутентифицирован и пытается попасть на страницы входа/регистрации
  if (isAuthenticated && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
