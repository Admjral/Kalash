import { Suspense } from "react"
import ClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"
import AuthGuard from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={<DashboardSkeleton />}>
        <ClientPage />
      </Suspense>
    </AuthGuard>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-[250px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[180px] rounded-lg" />
        <Skeleton className="h-[180px] rounded-lg" />
        <Skeleton className="h-[180px] rounded-lg" />
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  )
}
