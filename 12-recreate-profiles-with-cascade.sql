-- Полное пересоздание таблицы profiles с каскадным удалением зависимостей
-- Это решит проблему с кэшем схемы Supabase

-- Удаляем все зависимые таблицы в правильном порядке
DROP TABLE IF EXISTS public.coaching_sessions CASCADE;
DROP TABLE IF EXISTS public.subgoals CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.assessment_templates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Создаем таблицу profiles с правильной структурой
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Создаем функцию для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания профиля при регистрации
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Пересоздаем таблицу goals
CREATE TABLE public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Пересоздаем таблицу subgoals
CREATE TABLE public.subgoals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage subgoals of their own goals" ON public.subgoals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.goals 
            WHERE goals.id = subgoals.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE TRIGGER update_subgoals_updated_at
    BEFORE UPDATE ON public.subgoals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Пересоздаем таблицу coaching_sessions
CREATE TABLE public.coaching_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own coaching sessions" ON public.coaching_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_coaching_sessions_updated_at
    BEFORE UPDATE ON public.coaching_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Пересоздаем таблицы для оценок
CREATE TABLE public.assessment_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assessments" ON public.assessments
    FOR ALL USING (auth.uid() = user_id);

-- Добавляем базовые шаблоны оценок
INSERT INTO public.assessment_templates (name, description, questions) VALUES
('Самооценка мотивации', 'Оценка уровня мотивации к достижению целей', '[
    {"id": 1, "text": "Насколько вы мотивированы достигать своих целей?", "type": "scale", "min": 1, "max": 10},
    {"id": 2, "text": "Как часто вы откладываете важные дела?", "type": "scale", "min": 1, "max": 10},
    {"id": 3, "text": "Насколько легко вам сосредоточиться на задачах?", "type": "scale", "min": 1, "max": 10}
]'::jsonb);
