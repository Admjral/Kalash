import { PageLoader } from "@/components/page-loader"

export default function Loading() {
  return <PageLoader isLoading={true} message="Загрузка сессии коуча..." />
}
