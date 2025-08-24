"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Lightbulb, Star, MessageCircle, Loader2, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/local-storage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Insight {
  id: string
  text: string
  type: "tip" | "motivation" | "strategy"
}

export default function AICoachSession() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привет! Я ваш ИИ-коуч. Готов помочь вам достичь ваших целей. О чем хотели бы поговорить сегодня?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([])
  const [sessionRating, setSessionRating] = useState<number | null>(null)
  const [sessionStartTime] = useState(new Date())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Проверяем авторизацию
    const user = db.getCurrentUser()
    if (!user) {
      router.push("/auth/signin")
      return
    }
  }, [router])

  useEffect(() => {
    // Автоскролл к последнему сообщению
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = (userMessage: string): { response: string; insights: string[] } => {
    const responses = [
      {
        keywords: ["цель", "хочу", "планирую", "мечтаю"],
        response:
          "Отличная цель! Для её достижения важно разбить её на конкретные, измеримые шаги. Какой первый шаг вы могли бы сделать уже сегодня?",
        insights: ["Четко сформулированные цели увеличивают шансы на успех на 42%"],
      },
      {
        keywords: ["проблема", "трудность", "сложно", "не получается"],
        response:
          "Понимаю, что сейчас может быть непросто. Препятствия - это нормальная часть пути к цели. Давайте разберем, что именно вызывает трудности, и найдем способы их преодоления.",
        insights: ["Препятствия помогают развивать устойчивость и находить новые решения"],
      },
      {
        keywords: ["мотивация", "вдохновение", "энергия"],
        response:
          "Мотивация - это важный ресурс! Она может колебаться, и это нормально. Попробуйте вспомнить, зачем вам важна эта цель. Какие изменения она принесет в вашу жизнь?",
        insights: ["Внутренняя мотивация более устойчива, чем внешние стимулы"],
      },
      {
        keywords: ["время", "успеть", "дедлайн"],
        response:
          "Управление временем - ключевой навык. Рекомендую использовать технику временных блоков: выделите конкретное время для работы над целью каждый день.",
        insights: ["Регулярность важнее продолжительности - лучше 15 минут каждый день, чем 2 часа раз в неделю"],
      },
    ]

    // Находим подходящий ответ
    const matchedResponse = responses.find((r) =>
      r.keywords.some((keyword) => userMessage.toLowerCase().includes(keyword)),
    )

    if (matchedResponse) {
      return {
        response: matchedResponse.response,
        insights: matchedResponse.insights,
      }
    }

    // Общие ответы
    const generalResponses = [
      "Интересный вопрос! Расскажите больше о том, что вас беспокоит или интересует.",
      "Я вижу, что вы размышляете над важными вещами. Какие конкретные шаги вы уже предпринимали?",
      "Отлично, что вы обращаете внимание на это! Как вы думаете, что могло бы помочь в данной ситуации?",
      "Ваши мысли очень ценны. Давайте вместе найдем наилучший подход к решению этого вопроса.",
    ]

    return {
      response: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      insights: ["Рефлексия и самоанализ - важные инструменты личностного роста"],
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Симулируем задержку ИИ
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const { response, insights: newInsights } = generateAIResponse(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Добавляем инсайты
      if (newInsights.length > 0) {
        const insightObjects: Insight[] = newInsights.map((text, index) => ({
          id: Date.now() + index,
          text,
          type: "tip" as const,
        }))

        setInsights((prev) => [...prev, ...insightObjects])
      }
    } catch (error) {
      console.error("AI Coach error:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Извините, произошла ошибка. Попробуйте еще раз через несколько секунд.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const rateSession = async (rating: number) => {
    setSessionRating(rating)

    const user = db.getCurrentUser()
    if (user) {
      const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)

      // Сохраняем сессию
      db.createSession({
        user_id: user.id,
        session_type: "general-coaching",
        duration: duration,
        rating: rating,
        insights: insights.map((i) => i.text),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        })),
      })

      // Создаем достижения
      const userSessions = db.getSessions(user.id)
      if (userSessions.length === 1) {
        db.createAchievement({
          user_id: user.id,
          title: "Первая сессия",
          description: "Провели свою первую коуч-сессию",
          icon: "🎯",
        })
      }

      if (rating === 5) {
        db.createAchievement({
          user_id: user.id,
          title: "Отличная сессия",
          description: "Оценили сессию на 5 звезд",
          icon: "⭐",
        })
      }

      if (userSessions.length === 10) {
        db.createAchievement({
          user_id: user.id,
          title: "Активный коучи",
          description: "Провели 10 коуч-сессий",
          icon: "🏆",
        })
      }
    }
  }

  const currentDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Основной чат */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  ИИ-Коуч
                </CardTitle>
                <CardDescription>Персональный помощник для достижения ваших целей</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Онлайн
                </Badge>
                <Badge variant="outline">{currentDuration} мин</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100">
                          <User className="h-4 w-4 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Печатает...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Поле ввода */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите ваш вопрос или расскажите о своих целях..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Боковая панель */}
      <div className="space-y-4">
        {/* Инсайты */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Инсайты
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">Инсайты появятся в процессе беседы</p>
            ) : (
              <div className="space-y-3">
                {insights.slice(-3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-800">{insight.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Рейтинг сессии */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Оценка сессии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Как вам помогла эта сессия?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => rateSession(rating)}
                    className={`p-1 rounded ${
                      sessionRating && sessionRating >= rating
                        ? "text-yellow-500"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
              {sessionRating && <p className="text-sm text-green-600 mt-2">Спасибо за оценку!</p>}
            </div>
          </CardContent>
        </Card>

        {/* Статистика сессии */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Сообщений:</span>
                <span className="text-sm font-medium">{messages.length - 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Инсайтов:</span>
                <span className="text-sm font-medium">{insights.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Длительность:</span>
                <span className="text-sm font-medium">{currentDuration} мин</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
