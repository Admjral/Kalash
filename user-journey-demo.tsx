"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, BrainCircuit, BarChart, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const demoSteps = [
  {
    icon: Target,
    title: "1. Поставьте цель",
    description: "Определите, чего вы хотите достичь. Ваша цель должна быть конкретной и измеримой.",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
  },
  {
    icon: BrainCircuit,
    title: "2. Работайте с ИИ-коучем",
    description: "Наш коуч поможет разбить большую цель на маленькие шаги и будет поддерживать вас.",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
  },
  {
    icon: BarChart,
    title: "3. Отслеживайте прогресс",
    description: "Следите за своими достижениями с помощью наглядной аналитики и графиков.",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
  },
  {
    icon: CheckCircle,
    title: "4. Достигайте результатов!",
    description: "Празднуйте свои победы и ставьте новые, еще более амбициозные цели.",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
  },
]

// ИСПРАВЛЕНО: Возвращен именованный экспорт `export function`
export function UserJourneyDemo() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    setCurrentStep((prev) => (prev === demoSteps.length - 1 ? 0 : prev + 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev === 0 ? demoSteps.length - 1 : prev - 1))
  }

  const { icon: Icon, title, description, bgColor, textColor } = demoSteps[currentStep]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Как это работает?</CardTitle>
        <CardDescription>Ваш путь к успеху в 4 простых шага.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 rounded-lg text-center ${bgColor} ${textColor}`}
            >
              <Icon className="h-10 w-10 mb-3" />
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm mt-1">{description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="icon" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Предыдущий шаг</span>
          </Button>
          <div className="flex gap-2">
            {demoSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentStep === index ? "bg-primary" : "bg-muted-foreground/50"
                }`}
                aria-label={`Перейти к шагу ${index + 1}`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={nextStep}>
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Следующий шаг</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
