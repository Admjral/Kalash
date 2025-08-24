import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CoachClient from "./client-page"

export default async function CoachPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/signin")
    }

    // Получаем историю сессий пользователя
    const { data: sessions } = await supabase
      .from("coaching_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    return <CoachClient user={user} initialSessions={sessions || []} />
  } catch (error) {
    console.error("Coach page error:", error)
    redirect("/auth/signin")
  }
}
