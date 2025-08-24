-- Создаем таблицу subgoals если она не существует
CREATE TABLE IF NOT EXISTS public.subgoals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    due_date timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Включаем RLS
ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
DROP POLICY IF EXISTS "Users can view their own subgoals" ON public.subgoals;
CREATE POLICY "Users can view their own subgoals" ON public.subgoals
    FOR SELECT USING (
        goal_id IN (
            SELECT id FROM public.goals WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own subgoals" ON public.subgoals;
CREATE POLICY "Users can insert their own subgoals" ON public.subgoals
    FOR INSERT WITH CHECK (
        goal_id IN (
            SELECT id FROM public.goals WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own subgoals" ON public.subgoals;
CREATE POLICY "Users can update their own subgoals" ON public.subgoals
    FOR UPDATE USING (
        goal_id IN (
            SELECT id FROM public.goals WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own subgoals" ON public.subgoals;
CREATE POLICY "Users can delete their own subgoals" ON public.subgoals
    FOR DELETE USING (
        goal_id IN (
            SELECT id FROM public.goals WHERE user_id = auth.uid()
        )
    );

-- Создаем функцию для обновления updated_at если она не существует
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Удаляем существующий триггер если он есть
DROP TRIGGER IF EXISTS update_subgoals_updated_at ON public.subgoals;

-- Создаем новый триггер
CREATE TRIGGER update_subgoals_updated_at
    BEFORE UPDATE ON public.subgoals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_subgoals_goal_id ON public.subgoals(goal_id);
CREATE INDEX IF NOT EXISTS idx_subgoals_status ON public.subgoals(status);
CREATE INDEX IF NOT EXISTS idx_subgoals_due_date ON public.subgoals(due_date);
