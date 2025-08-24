import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CoachSessionClient from "./coach-session-client"

export default async function CoachSessionPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Получаем профиль пользователя
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/signin")
  }

  return <CoachSessionClient user={profile} />
}
