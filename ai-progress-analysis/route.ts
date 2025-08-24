import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { GoalsService } from "@/lib/services/goals"
import { AnalyticsService } from "@/lib/services/analytics"

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
    const { goalId, timeframe = "week" } = body

    // Получаем данные о цели и прогрессе
    const [goalData, progressHistory, userStats] = await Promise.all([
      goalId ? GoalsService.getGoalById(supabase, goalId, user.id) : null,
      goalId
        ? AnalyticsService.getGoalProgressHistory(supabase, user.id, goalId)
        : AnalyticsService.getGoalProgressHistory(supabase, user.id),
      AnalyticsService.getUserStats(supabase, user.id),
    ])

    // Проверяем кэш
    const cacheKey = `progress-analysis-${user.id}-${goalId || "all"}-${timeframe}`
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

    const contextData = {
      goal: goalData,
      progressHistory: progressHistory?.slice(-10), // Последние 10 записей
      userStats,
      timeframe,
    }

    const prompt = `Ты - персональный коуч по достижению целей. Проанализируй прогресс пользователя и дай персонализированные рекомендации.

Данные для анализа:
${JSON.stringify(contextData, null, 2)}

Проведи анализ и дай рекомендации по следующим аспектам:
1. Текущий прогресс и тренды
2. Выявленные проблемы или препятствия
3. Конкретные действия для улучшения
4. Мотивационные советы
5. Корректировка стратегии (если нужна)

Верни ответ в формате JSON:
{
  "analysis": {
    "progressTrend": "positive/negative/stable",
    "currentStatus": "краткое описание текущего состояния",
    "keyInsights": ["инсайт 1", "инсайт 2", "инсайт 3"]
  },
  "recommendations": [
    {
      "type": "action/strategy/motivation",
      "title": "Заголовок рекомендации",
      "description": "Подробное описание",
      "priority": "high/medium/low"
    }
  ],
  "motivationalMessage": "Персонализированное мотивационное сообщение"
}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    let parsedResponse
    try {
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

    // Сохраняем в кэш на 30 минут
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    await supabase.from("ai_cache").upsert({
      key: cacheKey,
      user_id: user.id,
      data: parsedResponse,
      expires_at: expiresAt.toISOString(),
    })

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error in AI progress analysis:", error)
    return NextResponse.json({ error: "Failed to analyze progress" }, { status: 500 })
  }
}
