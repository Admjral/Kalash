-- Финальное исправление базы данных для аутентификации
-- Этот скрипт можно запускать многократно без ошибок

-- 1. Удаляем проблемный триггер, если он существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Проверяем и создаем таблицу profiles с правильной структурой
DO $$
BEGIN
    -- Проверяем, существует ли таблица profiles
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Создаем таблицу profiles
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Таблица существует, проверяем и добавляем недостающие колонки
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
            ALTER TABLE public.profiles ADD COLUMN email TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
            ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
            ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END
$$;

-- 3. Включаем RLS для таблицы profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Удаляем все существующие политики для profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- 5. Создаем новые, правильные политики
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Создаем триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Проверяем и создаем таблицу subgoals, если она не существует
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subgoals') THEN
        CREATE TABLE public.subgoals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Включаем RLS для subgoals
        ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;
        
        -- Создаем политики для subgoals
        CREATE POLICY "Users can view their own subgoals" ON public.subgoals
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.goals 
                    WHERE goals.id = subgoals.goal_id 
                    AND goals.user_id = auth.uid()
                )
            );
            
        CREATE POLICY "Users can insert their own subgoals" ON public.subgoals
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.goals 
                    WHERE goals.id = subgoals.goal_id 
                    AND goals.user_id = auth.uid()
                )
            );
            
        CREATE POLICY "Users can update their own subgoals" ON public.subgoals
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.goals 
                    WHERE goals.id = subgoals.goal_id 
                    AND goals.user_id = auth.uid()
                )
            );
            
        CREATE POLICY "Users can delete their own subgoals" ON public.subgoals
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.goals 
                    WHERE goals.id = subgoals.goal_id 
                    AND goals.user_id = auth.uid()
                )
            );
        
        -- Создаем триггер для updated_at в subgoals
        CREATE TRIGGER handle_updated_at_subgoals
            BEFORE UPDATE ON public.subgoals
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END
$$;
