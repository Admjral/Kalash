import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssessmentsPage() {
  return (
    <Suspense fallback={<AssessmentsSkeleton />}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Оценки и тесты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssessmentCard
            title="Оценка личностных качеств"
            description="Узнайте свои сильные стороны и области для развития"
            questions={25}
            time={15}
            image="/placeholder.svg?height=200&width=300&text=Personality+Assessment"
          />

          <AssessmentCard
            title="Эмоциональный интеллект"
            description="Оцените свою способность понимать и управлять эмоциями"
            questions={30}
            time={20}
            image="/placeholder.svg?height=200&width=300&text=Emotional+Intelligence"
          />

          <AssessmentCard
            title="Стрессоустойчивость"
            description="Определите свой уровень стрессоустойчивости и стратегии совладания"
            questions={20}
            time={10}
            image="/placeholder.svg?height=200&width=300&text=Stress+Management"
          />

          <AssessmentCard
            title="Коммуникативные навыки"
            description="Оцените свои навыки общения и взаимодействия с другими"
            questions={35}
            time={25}
            image="/placeholder.svg?height=200&width=300&text=Communication+Skills"
          />

          <AssessmentCard
            title="Лидерские качества"
            description="Узнайте свой потенциал как лидера и руководителя"
            questions={40}
            time={30}
            image="/placeholder.svg?height=200&width=300&text=Leadership+Skills"
          />

          <AssessmentCard
            title="Карьерные предпочтения"
            description="Определите свои профессиональные интересы и склонности"
            questions={50}
            time={35}
            image="/placeholder.svg?height=200&width=300&text=Career+Preferences"
          />
        </div>
      </div>
    </Suspense>
  )
}

function AssessmentCard({ title, description, questions, time, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-40 overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>{questions} вопросов</span>
          <span>~{time} минут</span>
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
          Пройти тест
        </button>
      </div>
    </div>
  )
}

function AssessmentsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-[250px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
