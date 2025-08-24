"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  BarChart3,
} from "lucide-react"

interface ProgressAnalysisProps {
  goalData: {
    mainGoal: any
    subGoals: any[]
    sessions: any[]
  }
  onRecommendation: (recommendation: any) => void
}

export function ProgressAnalysis({ goalData, onRecommendation }: ProgressAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    analyzeProgress()
  }, [goalData])

  const analyzeProgress = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai-progress-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      })

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Ошибка анализа:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">ИИ анализирует ваш прогресс...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const getProgressTrend = (trend: string) => {
    switch (trend) {
      case "improving":
        return { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", label: "Улучшается" }
      case "declining":
        return { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50", label: "Снижается" }
      case "stable":
        return { icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50", label: "Стабильно" }
      default:
        return { icon: BarChart3, color: "text-gray-600", bg: "bg-gray-50", label: "Неопределенно" }
    }
  }

  const trendInfo = getProgressTrend(analysis.trend)
  const TrendIcon = trendInfo.icon

  return (
    <div className="space-y-6">
      {/* Overall Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Анализ прогресса от ИИ коуча
          </CardTitle>
          <CardDescription>Детальный анализ вашего движения к цели на основе проведенных сессий</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${trendInfo.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendIcon className={`h-5 w-5 ${trendInfo.color}`} />
                <span className="font-medium">Тренд прогресса</span>
              </div>
              <p className={`text-sm ${trendInfo.color}`}>{trendInfo.label}</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Эффективность</span>
              </div>
              <p className="text-sm text-blue-600">{analysis.efficiency}%</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Прогноз</span>
              </div>
              <p className="text-sm text-purple-600">{analysis.estimatedCompletion}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Общая оценка:</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.overallAssessment}</p>
          </div>
        </CardContent>
      </Card>

      {/* Sub Goals Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Анализ подцелей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.subGoalAnalysis?.map((subAnalysis: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{subAnalysis.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={subAnalysis.progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{subAnalysis.progress}%</span>
                  </div>
                </div>
                <Badge
                  className={
                    subAnalysis.status === "on_track"
                      ? "bg-green-100 text-green-800"
                      : subAnalysis.status === "at_risk"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {subAnalysis.status === "on_track"
                    ? "В норме"
                    : subAnalysis.status === "at_risk"
                      ? "Риск"
                      : "Проблема"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{subAnalysis.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="h-5 w-5" />
              Персональные рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.recommendations.map((rec: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      rec.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : rec.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {rec.priority === "high" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : rec.priority === "medium" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    {rec.actionSteps && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">Шаги к выполнению:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {rec.actionSteps.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} className="flex items-start gap-1">
                              <span className="text-blue-600">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onRecommendation(rec)} className="bg-transparent">
                    Применить
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session Impact */}
      {analysis.sessionImpact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Влияние сессий на прогресс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Средний прирост за сессию:</span>
                <span className="font-medium text-green-600">+{analysis.sessionImpact.averageGain}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Наиболее эффективный тип сессий:</span>
                <Badge variant="secondary">{analysis.sessionImpact.mostEffectiveType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Рекомендуемая частота:</span>
                <span className="font-medium">{analysis.sessionImpact.recommendedFrequency}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button onClick={analyzeProgress} className="mr-4">
              <Brain className="h-4 w-4 mr-2" />
              Обновить анализ
            </Button>
            <Button variant="outline" className="bg-transparent">
              Запланировать сессию
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
