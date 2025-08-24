import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { goalTitle, goalDescription, existingSubGoals = [] } = body

    if (!goalTitle) {
      return NextResponse.json({ error: "Goal title is required" }, { status: 400 })
    }

    // Проверяем кэш
    const cacheKey = `goal-decomposition-${user.id}-${Buffer.from(goalTitle + (goalDescription || "")).toString("base64")}`
    const { data: cachedData } = await supabase
      .from("ai_cache")
      .select("data")
      .eq("key", cacheKey)
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (cachedData) {
      return NextResponse.json(cachedData.data)
    }

    const existingSubGoalsText =
      existingSubGoals.length > 0
        ? `\n\nУже существующие подцели:\n${existingSubGoals.map((sg: any, i: number) => `${i + 1}. ${sg.title}${sg.description ? ` - ${sg.description}` : ""}`).join("\n")}`
        : ""

    const prompt = `Ты - эксперт по постановке целей и планированию. Помоги разбить следующую цель на конкретные, измеримые подцели.

Основная цель: "${goalTitle}"
${goalDescription ? `Описание: "${goalDescription}"` : ""}${existingSubGoalsText}

Создай 3-5 новых подцелей, которые:
1. Конкретны и измеримы
2. Достижимы и реалистичны
3. Имеют четкие критерии выполнения
4. Логически ведут к достижению основной цели
5. Не дублируют уже существующие подцели

Верни ответ в формате JSON:
{
  "subGoals": [
    {
      "title": "Название подцели",
      "description": "Подробное описание того, что нужно сделать"
    }
  ]
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    let parsedResponse
    try {
      // Извлекаем JSON из ответа
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Сохраняем в кэш на 1 час
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await supabase.from("ai_cache").upsert({
      key: cacheKey,
      user_id: user.id,
      data: parsedResponse,
      expires_at: expiresAt.toISOString(),
    })

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error in AI goal decomposition:", error)
    return NextResponse.json({ error: "Failed to generate subgoals" }, { status: 500 })
  }
}
