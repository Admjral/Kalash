"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: "Шаг 1: Постановка целей",
      description:
        "Начните с определения своих амбиций. NeuroCoach поможет вам разбить большие цели на управляемые шаги.",
      image: "/goal-setting-illustration.png",
      alt: "Иллюстрация постановки целей",
      features: ["Интерактивные шаблоны целей", "SMART-цели", "Визуализация прогресса"],
    },
    {
      title: "Шаг 2: Персонализированный AI-коучинг",
      description:
        "Получите индивидуальные рекомендации и планы действий, разработанные нашим AI на основе ваших уникальных потребностей.",
      image: "/ai-coaching-session.png",
      alt: "Иллюстрация AI-коучинга",
      features: ["Ежедневные задания", "Адаптивные стратегии", "Поддержка 24/7"],
    },
    {
      title: "Шаг 3: Отслеживание прогресса",
      description:
        "Следите за своим развитием с помощью подробных отчетов, графиков и аналитики, чтобы оставаться мотивированным.",
      image: "/progress-analysis-dashboard.png",
      alt: "Иллюстрация отслеживания прогресса",
      features: ["Интуитивные дашборды", "Отчеты о достижениях", "Настраиваемые метрики"],
    },
    {
      title: "Шаг 4: Сообщество и поддержка",
      description:
        "Общайтесь с единомышленниками, делитесь опытом и получайте дополнительную поддержку от сообщества NeuroCoach.",
      image: "/diverse-user-profiles.png",
      alt: "Иллюстрация сообщества",
      features: ["Форумы и группы", "Обмен знаниями", "Мотивационные истории"],
    },
    {
      title: "Шаг 5: Достигайте успеха!",
      description:
        "Применяйте полученные знания и поддержку, чтобы реализовать свой потенциал и достичь желаемых результатов в жизни.",
      image: "/abstract-neural-network.png",
      alt: "Иллюстрация успеха",
      features: ["Улучшение продуктивности", "Развитие навыков", "Личностный рост"],
    },
  ]

  const currentStep = steps[step - 1]

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">NeuroCoach Демо</span>
            </div>
            <CardTitle className="text-3xl font-bold">{currentStep.title}</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{currentStep.description}</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6 shadow-md">
              <img
                src={currentStep.image || "/placeholder.svg"}
                alt={currentStep.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Ключевые особенности:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {currentStep.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center mt-6">
              <Button onClick={handlePrev} disabled={step === 1} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Шаг {step} из {steps.length}
              </span>
              {step < steps.length ? (
                <Button onClick={handleNext} className="gradient-button">
                  Далее <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Link href="/auth/signup">
                  <Button className="gradient-button">
                    Начать сейчас <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
