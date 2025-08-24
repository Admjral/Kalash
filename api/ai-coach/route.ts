import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json()

    // Симуляция ответа ИИ коуча (в реальном проекте здесь будет OpenAI API)
    const responses = [
      "Отличный вопрос! Для достижения этой цели я рекомендую разбить её на более мелкие, управляемые задачи. Какой первый шаг вы могли бы предпринять уже сегодня?",
      "Понимаю ваши сомнения. Это нормально чувствовать неуверенность при движении к новым целям. Давайте сосредоточимся на ваших сильных сторонах - что у вас уже хорошо получается?",
      "Мотивация может колебаться, и это естественно. Важно создать систему, которая будет поддерживать вас даже в трудные дни. Какие ритуалы или привычки могли бы вам помочь?",
      "Прекрасно, что вы задумываются о личностном росте! Самосознание - это первый шаг к позитивным изменениям. Что конкретно вы хотели бы изменить или улучшить в себе?",
      "Препятствия - это возможности для роста. Каждая трудность учит нас чему-то новому. Как вы думаете, чему может научить вас текущая ситуация?",
    ]

    // Выбираем случайный ответ
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // В реальном проекте здесь будет вызов OpenAI API:
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Вы - профессиональный коуч по личностному развитию. Отвечайте на русском языке, давайте практические советы и задавайте наводящие вопросы."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    */

    return NextResponse.json({
      response: randomResponse,
      sessionId,
    })
  } catch (error) {
    console.error("AI Coach API error:", error)
    return NextResponse.json({ error: "Ошибка при обработке запроса" }, { status: 500 })
  }
}
