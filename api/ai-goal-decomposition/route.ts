import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { goalTitle } = await req.json()

    if (!goalTitle) {
      return new Response("Goal title is required", { status: 400 })
    }

    const prompt = `Разложи цель "${goalTitle}" на 3-5 конкретных, измеримых подцелей. 
    
Каждая подцель должна быть:
- Конкретной и понятной
- Измеримой
- Достижимой
- Релевантной основной цели
- Ограниченной по времени

Верни результат в формате JSON массива объектов с полями "title" и "description".
Пример:
[
  {
    "title": "Изучить основы грамматики",
    "description": "Пройти курс базовой грамматики за 2 недели"
  }
]`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Парсим JSON из ответа ИИ
    let subGoals
    try {
      // Ищем JSON в ответе
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        subGoals = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      // Если не удалось распарсить, создаем базовые подцели
      subGoals = [
        {
          title: "Планирование",
          description: "Составить детальный план достижения цели",
        },
        {
          title: "Первые шаги",
          description: "Определить и выполнить первые действия",
        },
        {
          title: "Промежуточная проверка",
          description: "Оценить прогресс и скорректировать план",
        },
      ]
    }

    return Response.json({ subGoals })
  } catch (error: any) {
    console.error("[AI Goal Decomposition Error]", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
