-- Отключаем RLS для всех таблиц, чтобы можно было удалить данные
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgoals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_history DISABLE ROW LEVEL SECURITY;

-- Удаляем все данные из таблиц в правильном порядке (сначала зависимые)
TRUNCATE TABLE public.goal_progress_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.subgoals RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.coaching_sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.assessment_results RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.goals RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.assessment_templates RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;

-- Включаем RLS обратно
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgoals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress_history ENABLE ROW LEVEL SECURITY;

-- Опционально: Если вы хотите удалить сами таблицы и функции, а не только данные,
-- используйте следующий блок. Это удалит всю структуру схемы `public`.
-- Будьте ОЧЕНЬ осторожны с этим.
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals CASCADE;
DROP TRIGGER IF EXISTS update_subgoals_updated_at ON public.subgoals CASCADE;
DROP TRIGGER IF EXISTS update_coaching_sessions_updated_at ON public.coaching_sessions CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP TRIGGER IF EXISTS on_subgoal_change ON public.subgoals CASCADE;
DROP FUNCTION IF EXISTS public.update_goal_progress() CASCADE;

DROP TABLE IF EXISTS public.goal_progress_history CASCADE;
DROP TABLE IF EXISTS public.subgoals CASCADE;
DROP TABLE IF EXISTS public.coaching_sessions CASCADE;
DROP TABLE IF EXISTS public.assessment_results CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.assessment_templates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
*/
