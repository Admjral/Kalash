"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Send, User, MessageCircle, Clock, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Session {
  id: string
  title: string
  created_at: string
  messages: Message[]
}

interface CoachClientProps {
  user: any
  initialSessions: any[]
}

export default function CoachClient({ user, initialSessions }: CoachClientProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const startNewSession = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .insert([
          {
            user_id: user.id,
            title: `Сессия ${new Date().toLocaleDateString("ru-RU")}`,
            messages: [],
          },
        ])
        .select()
        .single()

      if (error) throw error

      setCurrentSessionId(data.id)
      setMessages([])
      setSessions([data, ...sessions])

      toast({
        title: "Новая сессия",
        description: "Начата новая сессия с ИИ коучем",
      })
    } catch (error) {
      console.error("Error creating session:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать новую сессию",
        variant: "destructive",
      })
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.from("coaching_sessions").select("*").eq("id", sessionId).single()

      if (error) throw error

      setCurrentSessionId(sessionId)
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сессию",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    if (!currentSessionId) {
      await startNewSession()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Отправляем запрос к API
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: currentSessionId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Сохраняем сообщения в базу данных
      await supabase.from("coaching_sessions").update({ messages: finalMessages }).eq("id", currentSessionId)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от ИИ коуча",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">ИИ Коуч</span>
            </div>
            <Button onClick={startNewSession}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Новая сессия
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* История сессий */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  История сессий
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={currentSessionId === session.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => loadSession(session.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{session.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.created_at).toLocaleDateString("ru-RU")}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Чат */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Персональный ИИ Коуч
                </CardTitle>
                <CardDescription>Задавайте вопросы о целях, мотивации и личностном развитии</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Добро пожаловать к ИИ коучу!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Начните разговор, задав вопрос о ваших целях или проблемах
                        </p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar>
                            <AvatarFallback>
                              <Brain className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <Avatar>
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar>
                          <AvatarFallback>
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
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
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Задайте вопрос ИИ коучу..."
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
