import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GoalsClient from "./client-page"

export default async function GoalsPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/signin")
    }

    // Получаем все цели пользователя
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    return <GoalsClient user={user} initialGoals={goals || []} />
  } catch (error) {
    console.error("Goals page error:", error)
    redirect("/auth/signin")
  }
}
