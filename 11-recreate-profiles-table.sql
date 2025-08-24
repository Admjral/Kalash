-- ВНИМАНИЕ: Этот скрипт удалит все существующие данные в таблице 'profiles'.
-- Это принудительное исправление для гарантии правильности схемы.

-- Шаг 1: Удаляем существующую таблицу profiles, чтобы очистить кэш схемы.
DROP TABLE IF EXISTS public.profiles;

-- Шаг 2: Пересоздаем таблицу profiles с правильной и полной схемой.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Шаг 3: Добавляем комментарии для ясности.
COMMENT ON TABLE public.profiles IS 'Профили пользователей, связанные с auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'Ссылка на пользователя в auth.users.';

-- Шаг 4: Включаем защиту на уровне строк (Row Level Security).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Шаг 5: Удаляем старые политики, чтобы избежать конфликтов.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Шаг 6: Создаем необходимые и правильные политики безопасности.
-- 6.1: Пользователи могут видеть свой собственный профиль.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 6.2: Пользователи могут создавать свой собственный профиль.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 6.3: Пользователи могут обновлять свой собственный профиль.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
