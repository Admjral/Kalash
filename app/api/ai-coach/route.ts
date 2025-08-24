import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, sessionType, chatHistory, userGoals, selectedGoal } = await request.json()

    // Создаем контекст для AI коуча
    const systemPrompt = `Вы - профессиональный AI коуч, специализирующийся на помощи людям в достижении их целей. 

Тип текущей сессии: ${getSessionTypeDescription(sessionType)}

${
  selectedGoal
    ? `
Выбранная цель для работы:
- Название: "${selectedGoal.title}"
- Описание: "${selectedGoal.description}"
- Прогресс: ${selectedGoal.progress}%
- Статус: ${selectedGoal.status}
- Приоритет: ${selectedGoal.priority}
`
    : ""
}

Информация о пользователе:
- Активные цели: ${userGoals?.filter((g: any) => g.status === "active").length || 0}
- Цели пользователя: ${userGoals?.map((g: any) => `"${g.title}" (прогресс: ${g.progress}%)`).join(", ") || "Нет активных целей"}

Ваша роль:
- Работайте строго в рамках текущего типа сессии
- Задавайте только один наводящий вопрос за раз, чтобы углубиться в конкретную тему
- Двигайтесь пошагово: дожидайтесь ответа пользователя, затем задавайте следующий вопрос
- Помогайте структурировать мысли
- Предлагайте конкретные действия
- Мотивируйте и поддерживайте
- Используйте техники коучинга (GROW модель, активное слушание)
- Отвечайте на русском языке
- Будьте эмпатичными и понимающими

Стиль общения: дружелюбный, профессиональный, мотивирующий.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [
        ...chatHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("AI Coach API error:", error)
    return NextResponse.json({ error: "Ошибка при обращении к AI коучу" }, { status: 500 })
  }
}

function getSessionTypeDescription(sessionType: string): string {
  switch (sessionType) {
    case "goal-planning":
      return "Планирование целей - помощь в постановке SMART целей, разработке планов действий"
    case "motivation":
      return "Работа с мотивацией - поддержка, преодоление препятствий, поиск внутренней мотивации"
    case "progress-review":
      return "Анализ прогресса - оценка достижений, корректировка планов, празднование успехов"
    case "problem-solving":
      return "Решение проблем - поиск решений для препятствий и вызовов"
    default:
      return "Общая коуч-сессия - всесторонняя поддержка в достижении целей"
  }
}
