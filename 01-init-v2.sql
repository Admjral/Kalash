-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
-- Stores user-specific information, extending the auth.users table.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);
-- RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Goals Table
-- Stores the main goals for each user.
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'archived')),
  progress smallint NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date date,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- RLS Policies for Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own goals." ON public.goals;
CREATE POLICY "Users can manage their own goals." ON public.goals FOR ALL USING (auth.uid() = user_id);


-- 3. Subgoals Table
-- Stores sub-tasks for each main goal.
CREATE TABLE IF NOT EXISTS public.subgoals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- RLS Policies for Subgoals
ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own subgoals." ON public.subgoals;
CREATE POLICY "Users can manage their own subgoals." ON public.subgoals FOR ALL USING (auth.uid() = user_id);


-- 4. Assessment Templates Table
CREATE TABLE IF NOT EXISTS public.assessment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
-- RLS Policies for Assessment Templates
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Templates are viewable by authenticated users." ON public.assessment_templates;
CREATE POLICY "Templates are viewable by authenticated users." ON public.assessment_templates FOR SELECT USING (auth.role() = 'authenticated');


-- 5. Assessment Results Table
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.assessment_templates(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  score integer,
  interpretation text,
  completed_at timestamp with time zone DEFAULT now() NOT NULL
);
-- RLS Policies for Assessment Results
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own assessment results." ON public.assessment_results;
CREATE POLICY "Users can manage their own assessment results." ON public.assessment_results FOR ALL USING (auth.uid() = user_id);


-- 6. Coaching Sessions Table
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- RLS Policies for Coaching Sessions
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own coaching sessions." ON public.coaching_sessions;
CREATE POLICY "Users can manage their own coaching sessions." ON public.coaching_sessions FOR ALL USING (auth.uid() = user_id);


-- 7. Goal Progress History Table
CREATE TABLE IF NOT EXISTS public.goal_progress_history (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  progress smallint NOT NULL CHECK (progress >= 0 AND progress <= 100),
  recorded_at timestamp with time zone DEFAULT now() NOT NULL
);
-- RLS Policies for Progress History
ALTER TABLE public.goal_progress_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own progress history." ON public.goal_progress_history;
CREATE POLICY "Users can manage their own progress history." ON public.goal_progress_history FOR ALL USING (auth.uid() = user_id);


-- Function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update 'updated_at' on table changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_subgoals_updated_at ON public.subgoals;
CREATE TRIGGER update_subgoals_updated_at BEFORE UPDATE ON public.subgoals FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_coaching_sessions_updated_at ON public.coaching_sessions;
CREATE TRIGGER update_coaching_sessions_updated_at BEFORE UPDATE ON public.coaching_sessions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


-- Function to update a goal's progress based on its subgoals
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS trigger AS $$
DECLARE
  completed_count integer;
  total_count integer;
  new_progress integer;
  target_goal_id uuid;
BEGIN
  -- Determine the goal_id from the operation
  IF (TG_OP = 'DELETE') THEN
      target_goal_id := OLD.goal_id;
  ELSE
      target_goal_id := NEW.goal_id;
  END IF;

  -- Calculate progress
  SELECT
      COUNT(*) FILTER (WHERE status = 'completed'),
      COUNT(*)
  INTO
      completed_count,
      total_count
  FROM public.subgoals
  WHERE goal_id = target_goal_id;

  IF total_count > 0 THEN
      new_progress := (completed_count * 100) / total_count;
  ELSE
      new_progress := 0;
  END IF;

  -- Update the parent goal
  UPDATE public.goals
  SET progress = new_progress
  WHERE id = target_goal_id;

  RETURN NULL; -- The result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update goal progress when subgoals change
DROP TRIGGER IF EXISTS on_subgoal_change ON public.subgoals;
CREATE TRIGGER on_subgoal_change
  AFTER INSERT OR UPDATE OR DELETE ON public.subgoals
  FOR EACH ROW EXECUTE PROCEDURE public.update_goal_progress();


-- Seed data for assessment templates (safely)
INSERT INTO "public"."assessment_templates" (id, title, description, type, questions) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Оценка уровня стресса', 'Определите ваш текущий уровень стресса и получите рекомендации.', 'stress_level', '[{"id":"q1","text":"Как часто вы чувствуете себя перегруженным?","type":"scale","scale":{"min":1,"max":5,"labels":["Никогда","Редко","Иногда","Часто","Постоянно"]}},{"id":"q2","text":"Насколько хорошо вы спите?","type":"scale","scale":{"min":1,"max":5,"labels":["Очень плохо","Плохо","Нормально","Хорошо","Отлично"]}}]'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Оценка уровня мотивации', 'Узнайте ваш уровень мотивации и способы её повышения.', 'motivation_level', '[{"id":"q1","text":"Насколько вы мотивированы достигать своих целей?","type":"scale","scale":{"min":1,"max":5,"labels":["Совсем нет","Слабо","Умеренно","Сильно","Очень сильно"]}},{"id":"q2","text":"Как часто вы откладываете важные дела?","type":"scale","scale":{"min":1,"max":5,"labels":["Никогда","Редко","Иногда","Часто","Постоянно"]}}]')
ON CONFLICT (id) DO NOTHING;
