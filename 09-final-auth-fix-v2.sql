-- 1. Временно отключаем RLS, чтобы вносить изменения в структуру
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Принудительно добавляем колонку 'full_name', если её нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- 3. Удаляем старый, неработающий триггер и функцию
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Создаем НОВУЮ, ПРАВИЛЬНУЮ функцию, которая будет создавать профиль
-- Она запускается от имени системы (SECURITY DEFINER) и обходит RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- 5. Привязываем новую функцию к созданию пользователя в auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Включаем RLS обратно
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Удаляем ВСЕ СТАРЫЕ ПОЛИТИКИ, чтобы не было конфликтов.
-- Используем IF EXISTS, чтобы избежать ошибок, если политики уже нет.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles; -- ИСПРАВЛЕНО
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles; -- Старое неправильное имя на всякий случай

-- 8. Создаем ПРАВИЛЬНЫЕ политики безопасности
-- Разрешает пользователям видеть свой собственный профиль
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Разрешает пользователям обновлять свой собственный профиль
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Разрешает пользователям создать свой профиль
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);
