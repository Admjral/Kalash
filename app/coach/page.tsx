import { Suspense } from "react"
import ClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoachPage() {
  return (
    <Suspense fallback={<CoachSkeleton />}>
      <ClientPage />
    </Suspense>
  )
}

function CoachSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-[250px]" />
      <Skeleton className="h-[400px] rounded-lg" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  )
}
