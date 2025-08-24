import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"

interface Goal {
  id: string
  title: string
  description: string
  status: "active" | "completed" | "paused"
  progress: number
  target_date: string
  created_at: string
  user_id: string
}

interface GoalPageProps {
  params: Promise<{ id: string }>
}

async function getGoal(id: string, userId: string): Promise<Goal | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("goals").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching goal:", error)
    return null
  }

  return data
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Получаем текущего пользователя
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    notFound()
  }

  const goal = await getGoal(id, user.id)

  if (!goal) {
    notFound()
  }

  return (
    <Suspense fallback={<GoalDetailsSkeleton />}>
      <ClientPage goal={goal} />
    </Suspense>
  )
}

function GoalDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  )
}
