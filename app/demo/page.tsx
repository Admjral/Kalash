"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Brain, Target, LineChart, Send, ArrowRight, Home } from "lucide-react"

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Здравствуйте! Я ваш персональный ИИ-коуч. Это демонстрационный режим, где вы можете увидеть основные функции платформы. Чем я могу вам помочь? Что вы можете написать: (цели) - подробности о целях, (аналитика) или (прогресс) - подробности о аналатике и прогрессе, (коуч) - подробности о коуче",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const router = useRouter()

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    // Добавляем сообщение пользователя
    setChatMessages([...chatMessages, { role: "user", content: chatInput }])
    const userMessage = chatInput
    setChatInput("")
    setIsTyping(true)

    // Симулируем ответ ИИ
    setTimeout(() => {
      let response = ""

      if (userMessage.toLowerCase().includes("цель") || userMessage.toLowerCase().includes("цели")) {
        response =
          "В демо-режиме вы можете увидеть, как работает система постановки и отслеживания целей. Вы можете создавать цели, разбивать их на подзадачи и отслеживать прогресс. Хотите увидеть пример цели?"
      } else if (userMessage.toLowerCase().includes("аналитика") || userMessage.toLowerCase().includes("прогресс")) {
        response =
          "Аналитика в нашей платформе позволяет отслеживать ваш прогресс по различным целям и задачам. Вы можете видеть графики, диаграммы и статистику вашего развития. Хотите перейти к разделу аналитики?"
      } else if (userMessage.toLowerCase().includes("аналитика") || userMessage.toLowerCase().includes("коуч")) {
        response =
          "ИИ коуч базируется на gpt 4, но с большим функционалом и особенностями под специальность куоча, он интегрируется с вкладкой цели и если вы её указали, то он будет опираться на неё и помогать именно по ней"
      } else {
        response =
          "Это демонстрационный режим NeuroCoach Platform. Здесь вы можете ознакомиться с основными функциями: постановкой целей, сессиями с ИИ-коучем, аналитикой прогресса и управлением профилем. Что бы вы хотели узнать подробнее?"
      }

      setChatMessages([
        ...chatMessages,
        { role: "user", content: userMessage },
        { role: "assistant", content: response },
      ])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Демо-режим NeuroCoach Platform</h1>
          <p className="text-gray-600">Ознакомьтесь с основными функциями платформы в демонстрационном режиме</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          На главную
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          <TabsTrigger value="coach">ИИ-коуч</TabsTrigger>
          <TabsTrigger value="goals">Цели</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Обзор платформы</CardTitle>
              <CardDescription>Основные функции и возможности NeuroCoach Platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Target className="mr-2 h-5 w-5 text-blue-500" />
                      Управление целями
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Создавайте цели, разбивайте их на подзадачи и отслеживайте прогресс
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("goals")}>
                      Подробнее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Brain className="mr-2 h-5 w-5 text-purple-500" />
                      ИИ-коуч
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Персональный коуч на основе ИИ для достижения ваших целей
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("coach")}>
                      Подробнее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <LineChart className="mr-2 h-5 w-5 text-green-500" />
                      Аналитика прогресса
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Отслеживайте свой прогресс с помощью графиков и диаграмм
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("analytics")}>
                      Подробнее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={() => router.push("/auth/signup")}>Зарегистрироваться и начать</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coach">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-500" />
                Демо сессии с ИИ-коучем
              </CardTitle>
              <CardDescription>Попробуйте, как работает ИИ-коуч в демонстрационном режиме</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto p-4 border rounded-md mb-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <Avatar className="mr-2 mt-1">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="ml-2 mt-1">
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <Avatar className="mr-2 mt-1">
                      <AvatarImage src="/placeholder.svg?height=40&width=40&text=AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="flex space-x-2">
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Напишите сообщение..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isTyping || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-gray-600">
                <p>Попробуйте задать вопросы о целях, аналитике или функциях платформы</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Управление целями</CardTitle>
              <CardDescription>Демонстрация системы управления целями</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Улучшение навыков коммуникации</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Развитие навыков эффективного общения в профессиональной среде
                  </p>
                  <div className="flex items-center mt-1">
                    <Progress value={75} className="h-2 w-full mr-2" />
                    <span className="text-sm">75%</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Подзадачи:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Прочитать книгу "Эффективные коммуникации" ✓</li>
                      <li>Пройти онлайн-курс по публичным выступлениям ✓</li>
                      <li>Практиковать активное слушание</li>
                      <li>Подготовить и провести презентацию</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Развитие эмоционального интеллекта</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Улучшение понимания своих и чужих эмоций, развитие эмпатии
                  </p>
                  <div className="flex items-center mt-1">
                    <Progress value={40} className="h-2 w-full mr-2" />
                    <span className="text-sm">40%</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Подзадачи:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Вести дневник эмоций ✓</li>
                      <li>Пройти тест на эмоциональный интеллект ✓</li>
                      <li>Практиковать техники осознанности</li>
                      <li>Развивать навыки эмпатии</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-gray-600">
                <p>
                  В полной версии вы сможете создавать свои цели, отслеживать прогресс и получать рекомендации от
                  ИИ-коуча
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика прогресса</CardTitle>
              <CardDescription>Демонстрация аналитических инструментов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Общий прогресс</h3>
                <div className="h-[200px] flex items-end justify-between bg-gradient-to-t from-gray-50 to-transparent p-4 rounded-lg">
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[65%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Янв</div>
                    <div className="text-xs text-gray-500">78%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[72%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Фев</div>
                    <div className="text-xs text-gray-500">85%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[68%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Мар</div>
                    <div className="text-xs text-gray-500">82%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[88%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Апр</div>
                    <div className="text-xs text-gray-500">94%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[82%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Май</div>
                    <div className="text-xs text-gray-500">89%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[95%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Июн</div>
                    <div className="text-xs text-gray-500">97%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[91%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Июл</div>
                    <div className="text-xs text-gray-500">95%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[100%] w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Авг</div>
                    <div className="text-xs text-green-600 font-semibold">100%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[96%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Сен</div>
                    <div className="text-xs text-gray-500">98%</div>
                  </div>
                  <div className="w-[10%] flex flex-col items-center">
                    <div className="h-[93%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                    <div className="mt-2 text-xs font-medium">Окт</div>
                    <div className="text-xs text-gray-500">96%</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Средний прогресс за год:</span>
                    <span className="text-lg font-bold text-blue-600">91.4%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Распределение активности</h3>
                  <div className="h-[150px] flex items-center justify-center">
                    <div className="w-[150px] h-[150px] rounded-full border-8 border-gray-100 relative">
                      <div className="absolute inset-0 border-8 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full transform rotate-45"></div>
                      <div className="absolute inset-0 border-8 border-t-transparent border-r-transparent border-b-purple-500 border-l-purple-500 rounded-full transform rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm">Личностный рост (45%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm">Профессиональное развитие (55%)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Активность по дням недели</h3>
                  <div className="h-[150px] flex items-end justify-between bg-gradient-to-t from-gray-50 to-transparent p-3 rounded-lg">
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[85%] w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Пн</div>
                      <div className="text-xs text-gray-500">8.5ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[72%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Вт</div>
                      <div className="text-xs text-gray-500">7.2ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[95%] w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Ср</div>
                      <div className="text-xs text-gray-500">9.5ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[78%] w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Чт</div>
                      <div className="text-xs text-gray-500">7.8ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[100%] w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Пт</div>
                      <div className="text-xs text-green-600 font-semibold">10ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[55%] w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Сб</div>
                      <div className="text-xs text-gray-500">5.5ч</div>
                    </div>
                    <div className="w-[12%] flex flex-col items-center">
                      <div className="h-[42%] w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm shadow-sm"></div>
                      <div className="mt-2 text-xs font-medium">Вс</div>
                      <div className="text-xs text-gray-500">4.2ч</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Среднее время в день:</span>
                      <span className="text-sm font-bold text-green-600">7.4 часа</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-gray-600">
                <p>
                  В полной версии вы получите доступ к подробной аналитике вашего прогресса и рекомендациям по улучшению
                  результатов
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Хотите получить доступ ко всем функциям NeuroCoach Platform?</p>
        <Button onClick={() => router.push("/auth/signup")}>Зарегистрироваться сейчас</Button>
      </div>
    </div>
  )
}
