import { Suspense } from "react"
import ClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function GoalsPage() {
  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <ClientPage />
    </Suspense>
  )
}

function GoalsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-[250px]" />
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </div>
      <Skeleton className="h-[200px] rounded-lg" />
    </div>
  )
}
