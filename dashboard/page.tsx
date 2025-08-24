import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./client-page"

export default async function DashboardPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("No user found, redirecting to signin")
      redirect("/auth/signin")
    }

    // Получаем профиль пользователя
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Получаем последние цели
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    return <DashboardClient user={user} profile={profile} goals={goals || []} />
  } catch (error) {
    console.error("Dashboard error:", error)
    redirect("/auth/signin")
  }
}
