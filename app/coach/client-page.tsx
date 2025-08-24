"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Target, TrendingUp, Star, Clock, Send, Lightbulb, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { db, type Goal, type CoachingSession } from "@/lib/local-storage"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function CoachClientPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [chatMode, setChatMode] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionType, setSessionType] = useState<string>("")
  const [selectedGoal, setSelectedGoal] = useState<string>("")
  const [sessionRating, setSessionRating] = useState<number>(5)
  const [showRating, setShowRating] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    loadCoachData()
  }, [])

  const loadCoachData = async () => {
    try {
      const user = db.getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const userGoals = db.getGoals(user)
      const userSessions = db.getSessions(user)

      setGoals(userGoals)
      setSessions(userSessions)
      setLoading(false)
    } catch (error) {
      console.error("Error loading coach data:", error)
      setLoading(false)
    }
  }

  const handleStartSession = (type: string) => {
    if (type === "progress-review" && !selectedGoal && goals.length > 0) {
      toast.error("Пожалуйста, выберите цель для анализа прогресса")
      return
    }

    setSessionType(type)
    setChatMode(true)

    // Получаем информацию о выбранной цели
    const goalInfo = selectedGoal ? goals.find((g) => g.id === selectedGoal) : null

    const welcomeMessage = getWelcomeMessage(type, goalInfo)
    setChatHistory([{ role: "assistant", content: welcomeMessage }])
  }

  const getWelcomeMessage = (type: string, goalInfo?: Goal | null) => {
    switch (type) {
      case "goal-planning":
        return "Привет! Я ваш AI-коуч. Давайте поработаем над планированием ваших целей. Расскажите, какую цель вы хотите достичь или над какой уже работаете?"
      case "motivation":
        return "Здравствуйте! Я здесь, чтобы помочь вам с мотивацией. Что вас беспокоит? Может быть, вы чувствуете упадок сил или нужна поддержка?"
      case "progress-review":
        return goalInfo
          ? `Отлично! Давайте проанализируем ваш прогресс по цели "${goalInfo.title}" (${goalInfo.progress}%). Что получается хорошо, а где возникают трудности?`
          : "Отлично! Давайте проанализируем ваш прогресс. Расскажите, как дела с вашими текущими целями? Что получается хорошо, а где возникают трудности?"
      case "problem-solving":
        return "Я готов помочь вам решить любые проблемы! Опишите ситуацию, с которой вы столкнулись, и мы вместе найдем решение."
      default:
        return "Привет! Я ваш персональный AI-коуч. Чем могу помочь сегодня?"
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message.trim()
    setMessage("")
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    try {
      // Получаем информацию о выбранной цели
      const goalInfo = selectedGoal ? goals.find((g) => g.id === selectedGoal) : null

      // Реальный вызов к OpenAI API
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionType: sessionType,
          chatHistory: chatHistory,
          userGoals: goals,
          selectedGoal: goalInfo,
        }),
      })

      if (!response.ok) {
        throw new Error("Ошибка при обращении к AI")
      }

      const data = await response.json()
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("AI Coach error:", error)
      // Fallback на случай ошибки API
      const fallbackResponse =
        "Извините, произошла ошибка при обращении к AI. Попробуйте еще раз или обратитесь к поддержке."
      setChatHistory((prev) => [...prev, { role: "assistant", content: fallbackResponse }])
      toast.error("Ошибка при обращении к AI коучу")
    } finally {
      setIsTyping(false)
    }
  }

  const handleEndSession = () => {
    setShowRating(true)
  }

  const handleSubmitRating = () => {
    const user = db.getCurrentUser()
    if (!user) return

    // Создаем запись о сессии
    const insights = [
      "Важно разбивать большие цели на маленькие шаги",
      "Регулярная рефлексия помогает отслеживать прогресс",
      "Поддержка окружения критически важна для успеха",
    ]

    // Получаем информацию о выбранной цели
    const goalInfo = selectedGoal ? goals.find((g) => g.id === selectedGoal) : null

    const session = db.createSession(user, {
      session_type: sessionType,
      title: goalInfo
        ? `${getSessionTypeTitle(sessionType)}: ${goalInfo.title}`
        : `${getSessionTypeTitle(sessionType)}`,
      content: chatHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n"),
      insights,
      rating: sessionRating,
      duration: 30,
    })

    // Создаем достижение за проведение сессии
    if (sessions.length === 0) {
      db.createAchievement({
        user_id: user,
        title: "Первая сессия",
        description: "Провели первую коуч-сессию!",
        icon: "🎯",
      })
    }

    setChatMode(false)
    setChatHistory([])
    setSessionType("")
    setSelectedGoal("")
    setShowRating(false)
    loadCoachData()
    toast.success("Сессия завершена! Инсайты сохранены.")
  }

  const getSessionTypeTitle = (type: string) => {
    switch (type) {
      case "goal-planning":
        return "Планирование целей"
      case "motivation":
        return "Работа с мотивацией"
      case "progress-review":
        return "Анализ прогресса"
      case "problem-solving":
        return "Решение проблем"
      default:
        return "Общая сессия"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showRating) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Оцените сессию</CardTitle>
            <CardDescription>Ваша оценка поможет нам улучшить качество коучинга</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSessionRating(rating)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    sessionRating >= rating ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {sessionRating === 1 && "Очень плохо"}
              {sessionRating === 2 && "Плохо"}
              {sessionRating === 3 && "Нормально"}
              {sessionRating === 4 && "Хорошо"}
              {sessionRating === 5 && "Отлично"}
            </p>
            <Button onClick={handleSubmitRating} className="w-full">
              Завершить сессию
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (chatMode) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">AI Коуч-сессия: {getSessionTypeTitle(sessionType)}</h1>
          <Button variant="outline" onClick={handleEndSession}>
            Завершить сессию
          </Button>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
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
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напишите ваше сообщение..."
                className="flex-1"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Коуч</h1>
          <p className="text-muted-foreground">Персональный помощник для достижения ваших целей</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            На дашборд
          </Link>
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные цели</p>
                <p className="text-2xl font-bold">{goals.filter((g) => g.status === "active").length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Проведено сессий</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний рейтинг</p>
                <p className="text-2xl font-bold">
                  {sessions.length > 0
                    ? (sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Выбор цели */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Выберите цель для работы</CardTitle>
            <CardDescription>Выбор цели поможет коучу лучше понять ваши потребности</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите цель" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title} ({goal.progress}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Типы сессий */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите тип коуч-сессии</CardTitle>
          <CardDescription>Каждый тип сессии поможет вам в разных аспектах достижения целей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent"
              onClick={() => handleStartSession("goal-planning")}
            >
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Планирование целей</span>
              </div>
              <p className="text-sm text-gray-600 text-left">Определите новые цели или уточните существующие</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent"
              onClick={() => handleStartSession("motivation")}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Работа с мотивацией</span>
              </div>
              <p className="text-sm text-gray-600 text-left">Найдите внутреннюю мотивацию и преодолейте препятствия</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent"
              onClick={() => handleStartSession("progress-review")}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Анализ прогресса</span>
              </div>
              <p className="text-sm text-gray-600 text-left">Оцените достигнутые результаты и скорректируйте планы</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent"
              onClick={() => handleStartSession("problem-solving")}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">Решение проблем</span>
              </div>
              <p className="text-sm text-gray-600 text-left">Найдите решения для текущих вызовов и препятствий</p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* История сессий */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Последние сессии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions
                .slice(-5)
                .reverse()
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{session.title}</h4>
                      {session.session_type === "progress-review" && (
                        <p className="text-xs text-blue-600">Цель: {session.title.split(": ")[1] || "Общая"}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < session.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
