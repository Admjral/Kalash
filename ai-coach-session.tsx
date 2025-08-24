"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Send,
  Clock,
  Target,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Settings,
  AlertCircle,
  KeyRound,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import GoalDecomposition from "./goal-decomposition"
import { ProgressAnalysis } from "./progress-analysis"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import type { Profile, Goal } from "@/lib/supabase"

interface CoachSessionProps {
  userId: string
  sessionType: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
  userProfile: Profile | null
  currentGoals: Goal[]
}

export function AICoachSession({ userId, sessionType, userProfile, currentGoals }: CoachSessionProps) {
  const [sessionPhase, setSessionPhase] = useState<"intro" | "exploration" | "action" | "closure">("intro")
  const [sessionInsights, setSessionInsights] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [apiKey, setApiKey] = useState("")
  const [isKeySaved, setIsKeySaved] = useState(false)
  const [aiConfigError, setAiConfigError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const env = process.env.NEXT_PUBLIC_ENV ?? "all"

  const welcomeMessage = useMemo(() => {
    const userName = userProfile?.full_name || "друг"
    const greetings = {
      "goal-setting": `Привет, ${userName}! 👋

Меня зовут Алекс, и я ваш персональный ИИ коуч. Рад приветствовать вас на сессии по постановке целей!

Сегодня мы вместе:
✨ Определим ваши истинные желания и приоритеты
🎯 Сформулируем четкие и достижимые цели
📋 Создадим конкретный план действий

Помните: каждая великая история начинается с одного шага. И сегодня мы сделаем этот шаг вместе!

Расскажите, что привело вас сюда? Какие мечты или задачи крутятся у вас в голове? 🤔`,

      "progress-review": `Добро пожаловать, ${userName}! 🌟

Отлично, что вы здесь! Регулярный анализ прогресса — это признак мудрого человека, который серьезно относится к своему развитию.

На этой сессии мы:
📊 Честно оценим ваши достижения
🔍 Выявим что работает, а что можно улучшить
🚀 Скорректируем стратегию для еще лучших результатов

${currentGoals.length > 0 ? `Я вижу, у вас есть ${currentGoals.length} активных целей. Это здорово!` : "Давайте начнем с того, над чем вы сейчас работаете."}

Как дела с вашими целями? Что удается легко, а где чувствуете сопротивление? 💭`,

      "problem-solving": `Здравствуйте, ${userName}! 💪

Вы пришли в нужное место! Каждая проблема — это замаскированная возможность для роста. И я здесь, чтобы помочь вам это увидеть.

Сегодня мы:
🧩 Разберем ситуацию по частям
💡 Найдем неочевидные решения
⚡ Составим четкий план действий

Помните: нет проблем, есть только задачи, которые еще не решены. А любую задачу можно решить, если подойти к ней правильно!

Расскажите, с какой ситуацией вы столкнулись? Что именно вас беспокоит? 🤝`,

      "emotional-support": `Привет, ${userName}! 🤗

Спасибо, что доверились мне. Обращение за поддержкой — это проявление силы, а не слабости. Это показывает, что вы заботитесь о себе.

В этом безопасном пространстве мы:
💙 Разберемся с вашими чувствами
🌱 Найдем внутренние ресурсы
🧘 Освоим техники для душевного равновесия

Помните: все эмоции временны, даже самые тяжелые. И вы сильнее, чем думаете.

Как вы себя чувствуете прямо сейчас? Что происходит в вашей жизни? Я здесь, чтобы выслушать и поддержать. 💚`,
    }
    return greetings[sessionType] || greetings["goal-setting"]
  }, [sessionType, userProfile?.full_name, currentGoals.length])

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setIsKeySaved(true)
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai-coach",
    body: {
      userId,
      sessionType,
      userProfile,
      currentGoals,
      apiKey, // Передаем ключ в API
    },
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: welcomeMessage,
        createdAt: new Date(),
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)

      if (error.message?.includes("API key") || error.message?.includes("401")) {
        setAiConfigError("Ключ OpenAI API не настроен или недействителен. Введите ваш ключ ниже, чтобы продолжить.")
        setIsKeySaved(false) // Сбрасываем статус, если ключ невалиден
      } else if (error.message?.includes("quota") || error.message?.includes("billing")) {
        setAiConfigError("Превышена квота OpenAI API. Проверьте настройки биллинга.")
      } else if (error.message?.includes("fetch")) {
        toast({
          title: "Ошибка подключения",
          description: "Проблема с подключением к серверу. Проверьте интернет-соединение.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Ошибка чата",
          description: "Не удалось получить ответ от коуча. Попробуйте еще раз.",
          variant: "destructive",
        })
      }
    },
    onFinish: (message) => {
      analyzeCoachResponse(message.content)
      extractInsights(message.content)
    },
  })

  useEffect(() => {
    if (error) {
      console.error("useChat error:", error)
    }
  }, [error])

  const analyzeCoachResponse = (content: string) => {
    if (content.includes("домашнее задание") || content.includes("до встречи")) setSessionPhase("closure")
    else if (content.includes("попробуй") || content.includes("упражнение") || content.includes("декомпозиция"))
      setSessionPhase("action")
    else if (content.includes("расскажи") || content.includes("как ты")) setSessionPhase("exploration")
  }

  const extractInsights = (content: string) => {
    if (content.includes("важно понимать") || content.includes("ключевой момент")) {
      const insight = content.split(".")[0] + "."
      setSessionInsights((prev) => [...prev.slice(-2), insight])
    }
  }

  const handleGoalDecomposition = (subGoals: any[]) => {
    console.log("Сохраняем подцели:", subGoals)
    setActiveTab("chat")
  }

  const handleProgressAnalysis = (goalData: any) => {
    setSelectedGoal(goalData)
    setActiveTab("analysis")
  }

  const handleRecommendation = (recommendation: any) => {
    console.log("Применяем рекомендацию:", recommendation)
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "intro":
        return <Brain className="h-4 w-4" />
      case "exploration":
        return <Target className="h-4 w-4" />
      case "action":
        return <Lightbulb className="h-4 w-4" />
      case "closure":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "intro":
        return "Знакомство"
      case "exploration":
        return "Исследование"
      case "action":
        return "Действие"
      case "closure":
        return "Завершение"
      default:
        return "Сессия"
    }
  }

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      "goal-setting": "Постановка целей",
      "progress-review": "Обзор прогресса",
      "problem-solving": "Решение проблем",
      "emotional-support": "Эмоциональная поддержка",
    }
    return labels[type as keyof typeof labels] || "Сессия"
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSaveKey = () => {
    if (apiKey.trim().startsWith("sk-")) {
      localStorage.setItem("openai_api_key", apiKey.trim())
      setIsKeySaved(true)
      setAiConfigError(null)
      toast({
        title: "API ключ сохранен",
        description: "Ключ сохранен в вашем браузере. Можете начинать сессию.",
      })
    } else {
      toast({
        title: "Неверный формат ключа",
        description: "Ключ OpenAI API должен начинаться с 'sk-'.",
        variant: "destructive",
      })
    }
  }

  const canSubmit = !isLoading && input?.trim().length > 0 && isKeySaved

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      return
    }
    handleSubmit(e)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-6"
    >
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Brain className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Алекс - ваш ИИ коуч
                  <Badge variant="secondary" className="ml-2">
                    {getPhaseIcon(sessionPhase)}
                    {getPhaseLabel(sessionPhase)}
                  </Badge>
                  {aiConfigError && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Ошибка
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Сессия: {getSessionTypeLabel(sessionType)}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {aiConfigError && (
        <Card className="mb-6 border-red-400 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 text-red-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-8 w-8 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold">Требуется настройка ИИ-коуча</h3>
                  <p className="text-sm">{aiConfigError}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <KeyRound className="h-5 w-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Введите ваш OpenAI API ключ (sk-...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="border-red-300 focus-visible:ring-red-500"
                />
                <Button variant="destructive" onClick={handleSaveKey}>
                  Сохранить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {env === "all" && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-xs text-blue-800">
              <p>Debug Info (Environment: {env}):</p>
              <p>Messages count: {messages.length}</p>
              <p>Input length: {input?.length || 0}</p>
              <p>Input value: "{input}"</p>
              <p>Input trimmed length: {input?.trim().length || 0}</p>
              <p>Is loading: {isLoading ? "true" : "false"}</p>
              <p>Can submit: {canSubmit ? "true" : "false"}</p>
              <p>AI Config Error: {aiConfigError ? "Yes" : "No"}</p>
              <p>Error: {error?.message || "None"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Диалог с коучем</TabsTrigger>
          <TabsTrigger value="decomposition">Декомпозиция целей</TabsTrigger>
          <TabsTrigger value="analysis">Анализ прогресса</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Диалог с коучем</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <motion.div layout className="space-y-4">
                      {messages.map((message, i) => (
                        <motion.div
                          key={message.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.02 }}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                <Brain className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 border"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {new Date(message.createdAt || Date.now()).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {message.role === "user" && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                {userProfile?.full_name?.[0] || "У"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3 justify-start"
                        >
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              <Brain className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg px-4 py-2 border flex items-center gap-2">
                            <span className="text-sm text-gray-500">Алекс печатает</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </ScrollArea>

                  <form onSubmit={onSubmit} className="flex gap-2 mt-4">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder={!isKeySaved ? "Сначала введите API ключ" : "Напишите ваш ответ..."}
                      className="flex-1"
                      disabled={isLoading || !isKeySaved}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (canSubmit) {
                            onSubmit(e as any)
                          }
                        }
                      }}
                    />
                    <Button type="submit" disabled={!canSubmit}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Прогресс сессии</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["intro", "exploration", "action", "closure"].map((phase, index) => (
                    <div key={phase} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          sessionPhase === phase
                            ? "bg-blue-600"
                            : index < ["intro", "exploration", "action", "closure"].indexOf(sessionPhase)
                              ? "bg-green-600"
                              : "bg-gray-200"
                        }`}
                      />
                      <span className="text-sm">{getPhaseLabel(phase)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {currentGoals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ваши цели</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {currentGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="text-sm">
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-gray-500 text-xs">{goal.progress}% завершено</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {sessionInsights.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Инсайты сессии</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sessionInsights.map((insight, index) => (
                      <div key={index} className="text-sm p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                        {insight}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Инструменты коуча</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs bg-transparent"
                    onClick={() => setActiveTab("decomposition")}
                  >
                    <Target className="h-3 w-3 mr-2" />
                    Декомпозиция целей
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs bg-transparent"
                    onClick={() => setActiveTab("analysis")}
                  >
                    <TrendingUp className="h-3 w-3 mr-2" />
                    Анализ прогресса
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                    <Settings className="h-3 w-3 mr-2" />
                    Настройки сессии
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decomposition" className="mt-6">
          {currentGoals.length > 0 ? (
            <GoalDecomposition
              mainGoal={currentGoals[0]}
              onSave={handleGoalDecomposition}
              onAnalyze={handleProgressAnalysis}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет активных целей</h3>
                <p className="text-gray-600 mb-4">Создайте цель, чтобы использовать декомпозицию</p>
                <Button>Создать цель</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          {selectedGoal ? (
            <ProgressAnalysis goalData={selectedGoal} onRecommendation={handleRecommendation} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Выберите цель для анализа</h3>
                <p className="text-gray-600 mb-4">Перейдите в декомпозицию и нажмите "Анализ прогресса"</p>
                <Button onClick={() => setActiveTab("decomposition")}>Перейти к декомпозиции</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
