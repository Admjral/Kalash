import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./client-page"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Получаем профиль пользователя
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <ProfileClient user={user} profile={profile} />
}
