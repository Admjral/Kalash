-- Создаем таблицу subgoals
CREATE TABLE IF NOT EXISTS public.subgoals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_subgoals_goal_id ON public.subgoals(goal_id);
CREATE INDEX IF NOT EXISTS idx_subgoals_user_id ON public.subgoals(user_id);
CREATE INDEX IF NOT EXISTS idx_subgoals_order ON public.subgoals(goal_id, order_index);

-- Включаем RLS
ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS
CREATE POLICY "Users can view their own subgoals" ON public.subgoals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subgoals" ON public.subgoals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subgoals" ON public.subgoals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subgoals" ON public.subgoals
    FOR DELETE USING (auth.uid() = user_id);

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subgoals_updated_at BEFORE UPDATE ON public.subgoals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
