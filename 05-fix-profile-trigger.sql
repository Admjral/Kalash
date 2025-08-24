-- Удаляем старый триггер если он есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Создаем функцию для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Создаем триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Проверяем, что таблица subgoals существует
CREATE TABLE IF NOT EXISTS public.subgoals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем индексы для subgoals
CREATE INDEX IF NOT EXISTS idx_subgoals_goal_id ON public.subgoals(goal_id);
CREATE INDEX IF NOT EXISTS idx_subgoals_status ON public.subgoals(status);

-- Создаем триггер для updated_at в subgoals
DROP TRIGGER IF EXISTS update_subgoals_updated_at ON public.subgoals;
CREATE TRIGGER update_subgoals_updated_at
  BEFORE UPDATE ON public.subgoals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем RLS для subgoals
ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;

-- Создаем политики для subgoals
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
