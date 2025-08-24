'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Получаем данные из формы
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Валидация
  if (!fullName || !email || !password) {
    return {
      error: 'Все поля обязательны для заполнения'
    }
  }

  if (password.length < 6) {
    return {
      error: 'Пароль должен содержать минимум 6 символов'
    }
  }

  try {
    // Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      return {
        error: `Ошибка регистрации: ${error.message}`
      }
    }

    if (!data.user) {
      return {
        error: 'Не удалось создать пользователя'
      }
    }

    // Если пользователь создан, но профиль не создался автоматически, создаем вручную
    if (data.user) {
      // Небольшая задержка для триггера
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Проверяем, создался ли профиль
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Создаем профиль вручную
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          return {
            error: `Аккаунт создан, но не удалось настроить профиль: ${profileError.message}`
          }
        }
      }
    }

    return {
      success: 'Аккаунт успешно создан! Добро пожаловать в NeuroCoach!'
    }

  } catch (error) {
    console.error('Unexpected signup error:', error)
    return {
      error: 'Произошла неожиданная ошибка. Попробуйте еще раз.'
    }
  }
}
