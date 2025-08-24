import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AnalyticsClient from "./client-page"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Получаем данные для аналитики
  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id)

  return <AnalyticsClient goals={goals || []} userId={user.id} />
}
