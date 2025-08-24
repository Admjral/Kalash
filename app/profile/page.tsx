import { Suspense } from "react"
import ClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ClientPage />
    </Suspense>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-[250px]" />
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-[300px] w-full md:w-1/3 rounded-lg" />
        <Skeleton className="h-[300px] w-full md:w-2/3 rounded-lg" />
      </div>
    </div>
  )
}
