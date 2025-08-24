-- Создаем таблицу подцелей
CREATE TABLE IF NOT EXISTS subgoals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS subgoals_goal_id_idx ON subgoals(goal_id);
CREATE INDEX IF NOT EXISTS subgoals_status_idx ON subgoals(status);

-- Включаем RLS
ALTER TABLE subgoals ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS
CREATE POLICY "Users can view their own subgoals" ON subgoals
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subgoals" ON subgoals
  FOR INSERT WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own subgoals" ON subgoals
  FOR UPDATE USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own subgoals" ON subgoals
  FOR DELETE USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_subgoals_updated_at BEFORE UPDATE ON subgoals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
