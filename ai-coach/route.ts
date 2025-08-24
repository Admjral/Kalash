import { streamText } from "ai"
import { openai, type OpenAI } from "@ai-sdk/openai"
import { createClient } from "@/lib/supabase/server"
import { GoalsService } from "@/lib/services/goals"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, apiKey } = await req.json()

    const goalsService = new GoalsService(supabase)
    const userGoals = await goalsService.getUserGoals(user.id)
    const goalsContext = userGoals
      .map(
        (g) =>
          `- Цель: "${g.title}" (Прогресс: ${g.progress}%). Подцели: ${
            g.subgoals.length > 0 ? g.subgoals.map((sg) => `"${sg.title}"`).join(", ") : "нет"
          }`,
      )
      .join("\n")

    const systemPrompt = `Ты — эмпатичный и поддерживающий ИИ-коуч по имени Алекс. Твоя задача — помогать пользователю в достижении его целей, используя когнитивно-поведенческие техники.

    Твои принципы:
    1.  **Эмпатия и поддержка**: Всегда начинай с поддержки. Признавай чувства и усилия пользователя.
    2.  **Конкретика**: Задавай открытые, уточняющие вопросы, чтобы помочь пользователю разбить большие проблемы на маленькие шаги.
    3.  **Фокус на решении**: Помогай пользователю найти собственные решения, а не давай готовые ответы. Спрашивай: "Какой мог бы быть твой первый шаг?", "Что тебе может помочь?".
    4.  **Контекст пользователя**: У тебя есть доступ к текущим целям пользователя. Используй эту информацию, чтобы сделать диалог более личным и релевантным.
    5.  **Краткость**: Твои ответы должны быть короткими и по существу, 1-3 предложения.

    Текущий контекст пользователя:
    ${goalsContext || "У пользователя пока нет активных целей."}

    Начинай диалог с приветствия и открытого вопроса, например: "Привет! Рад тебя видеть. Как твои дела сегодня? Над чем хочешь поработать?"`

    let openaiClient: OpenAI
    if (apiKey && typeof apiKey === "string" && apiKey.startsWith("sk-")) {
      // Используем ключ, предоставленный пользователем
      openaiClient = openai.withApiKey(apiKey)
    } else {
      // Используем ключ из переменных окружения на сервере
      openaiClient = openai
    }

    const result = await streamText({
      model: openaiClient("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return result.toAIStreamResponse()
  } catch (error: any) {
    console.error("[AI Coach API Error]", error)
    if (error.name === "AI_API_AuthenticationError" || error.status === 401) {
      return new Response("Неверный или неактивный ключ OpenAI API.", { status: 401 })
    }
    return new Response("Произошла ошибка на сервере.", { status: 500 })
  }
}
