-- Удаляем существующие политики если они есть
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
DROP POLICY IF EXISTS "Users can view own subgoals" ON subgoals;
DROP POLICY IF EXISTS "Users can insert own subgoals" ON subgoals;
DROP POLICY IF EXISTS "Users can update own subgoals" ON subgoals;
DROP POLICY IF EXISTS "Users can delete own subgoals" ON subgoals;
DROP POLICY IF EXISTS "Users can view own coaching sessions" ON coaching_sessions;
DROP POLICY IF EXISTS "Users can insert own coaching sessions" ON coaching_sessions;
DROP POLICY IF EXISTS "Users can update own coaching sessions" ON coaching_sessions;
DROP POLICY IF EXISTS "Users can delete own coaching sessions" ON coaching_sessions;

-- Создаем таблицы если они не существуют
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subgoals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgoals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Создаем политики для profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Создаем политики для goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для subgoals
CREATE POLICY "Users can view own subgoals" ON subgoals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = subgoals.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subgoals" ON subgoals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = subgoals.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own subgoals" ON subgoals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = subgoals.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own subgoals" ON subgoals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = subgoals.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Создаем политики для coaching_sessions
CREATE POLICY "Users can view own coaching sessions" ON coaching_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coaching sessions" ON coaching_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coaching sessions" ON coaching_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Создаем функцию для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
