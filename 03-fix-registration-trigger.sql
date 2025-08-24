-- 1. Удаляем старую, неработающую функцию и триггер, если они существуют.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Создаем новую, правильную функцию.
-- Она будет автоматически вызываться при регистрации нового пользователя.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Эта функция создает запись в вашей таблице 'profiles'
  -- и правильно извлекает 'full_name' из метаданных пользователя.
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- 3. Создаем новый триггер, который будет запускать нашу функцию.
-- Он срабатывает ПОСЛЕ того, как новый пользователь был добавлен в систему аутентификации.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
