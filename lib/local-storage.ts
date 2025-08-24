// Простое хеширование пароля (для демонстрации)
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// Типы данных
export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export interface Profile {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  progress: number
  target_date: string
  created_at: string
  updated_at: string
}

export interface Subgoal {
  id: string
  goalId: string
  title: string
  completed: boolean
  createdAt: string
}

export interface CoachingSession {
  id: string
  user_id: string
  session_type: string
  title: string
  content: string
  insights: string[]
  rating: number
  duration: number
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  icon: string
  earned_at: string
}

export interface Analytics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalSessions: number
  avgProgress: number
  avgRating: number
}

// Класс для работы с локальной базой данных
export class LocalDatabase {
  private getStorageKey(table: string): string {
    return `neurocoach_${table}`
  }

  private getData<T>(table: string): T[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.getStorageKey(table))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading ${table} from localStorage:`, error)
      return []
    }
  }

  private setData<T>(table: string, data: T[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${table} to localStorage:`, error)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Пользователи
  createUser(email: string, password: string, name: string, createDemoData = false): User {
    const users = this.getData<User>("users")

    // Проверяем, существует ли пользователь
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует")
    }

    const user: User = {
      id: this.generateId(),
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }

    users.push(user)
    this.setData("users", users)

    // Создаем профиль
    this.createProfile(user.id, name.trim(), email.toLowerCase().trim())

    // Создаем демо-данные только если указано
    if (createDemoData) {
      this.createDemoData(user.id)
    } else {
      // Для новых пользователей создаем только базовое достижение
      this.createAchievement({
        user_id: user.id,
        title: "Добро пожаловать!",
        description: "Вы успешно зарегистрировались в NeuroCoach",
        icon: "🎯",
      })
    }

    return user
  }

  getUserByEmail(email: string): User | null {
    const users = this.getData<User>("users")
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null
  }

  getUserById(id: string): User | null {
    const users = this.getData<User>("users")
    return users.find((u) => u.id === id) || null
  }

  verifyPassword(email: string, password: string): User | null {
    const user = this.getUserByEmail(email.toLowerCase().trim())
    if (!user) return null

    const hashedPassword = hashPassword(password)
    return user.password === hashedPassword ? user : null
  }

  // Профили
  createProfile(userId: string, name: string, email: string): Profile {
    const profiles = this.getData<Profile>("profiles")

    const profile: Profile = {
      id: this.generateId(),
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    profiles.push(profile)
    this.setData("profiles", profiles)
    return profile
  }

  getProfileByUserId(userId: string): Profile | null {
    const profiles = this.getData<Profile>("profiles")
    return profiles.find((p) => p.userId === userId) || null
  }

  updateProfile(userId: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getData<Profile>("profiles")
    const index = profiles.findIndex((p) => p.userId === userId)

    if (index === -1) return null

    profiles[index] = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.setData("profiles", profiles)
    return profiles[index]
  }

  // Цели
  createGoal(userId: string, goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">): Goal {
    const goals = this.getData<Goal>("goals")

    const goal: Goal = {
      id: this.generateId(),
      user_id: userId,
      ...goalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    goals.push(goal)
    this.setData("goals", goals)
    return goal
  }

  getGoals(userId: string): Goal[] {
    const goals = this.getData<Goal>("goals")
    return goals.filter((g) => g.user_id === userId)
  }

  getGoalsByUserId(userId: string): Goal[] {
    return this.getGoals(userId)
  }

  getGoal(id: string): Goal | null {
    const goals = this.getData<Goal>("goals")
    return goals.find((g) => g.id === id) || null
  }

  getGoalById(id: string): Goal | null {
    return this.getGoal(id)
  }

  updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const goals = this.getData<Goal>("goals")
    const index = goals.findIndex((g) => g.id === id)

    if (index === -1) return null

    goals[index] = {
      ...goals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    this.setData("goals", goals)
    return goals[index]
  }

  deleteGoal(id: string): boolean {
    const goals = this.getData<Goal>("goals")
    const filteredGoals = goals.filter((g) => g.id !== id)

    if (filteredGoals.length === goals.length) return false

    this.setData("goals", filteredGoals)

    // Удаляем связанные подцели
    const subgoals = this.getData<Subgoal>("subgoals")
    const filteredSubgoals = subgoals.filter((s) => s.goalId !== id)
    this.setData("subgoals", filteredSubgoals)

    return true
  }

  // Подцели
  createSubgoal(goalId: string, title: string): Subgoal {
    const subgoals = this.getData<Subgoal>("subgoals")

    const subgoal: Subgoal = {
      id: this.generateId(),
      goalId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    subgoals.push(subgoal)
    this.setData("subgoals", subgoals)
    return subgoal
  }

  getSubgoals(goalId: string): Subgoal[] {
    const subgoals = this.getData<Subgoal>("subgoals")
    return subgoals.filter((s) => s.goalId === goalId)
  }

  getSubgoalsByGoalId(goalId: string): Subgoal[] {
    return this.getSubgoals(goalId)
  }

  updateSubgoal(id: string, updates: Partial<Subgoal>): Subgoal | null {
    const subgoals = this.getData<Subgoal>("subgoals")
    const index = subgoals.findIndex((s) => s.id === id)

    if (index === -1) return null

    subgoals[index] = { ...subgoals[index], ...updates }
    this.setData("subgoals", subgoals)
    return subgoals[index]
  }

  deleteSubgoal(id: string): boolean {
    const subgoals = this.getData<Subgoal>("subgoals")
    const filteredSubgoals = subgoals.filter((s) => s.id !== id)

    if (filteredSubgoals.length === subgoals.length) return false

    this.setData("subgoals", filteredSubgoals)
    return true
  }

  // Сессии коучинга
  createSession(userId: string, sessionData: Omit<CoachingSession, "id" | "user_id" | "created_at">): CoachingSession {
    const sessions = this.getData<CoachingSession>("sessions")

    const session: CoachingSession = {
      id: this.generateId(),
      user_id: userId,
      ...sessionData,
      created_at: new Date().toISOString(),
    }

    sessions.push(session)
    this.setData("sessions", sessions)
    return session
  }

  getSessions(userId: string): CoachingSession[] {
    const sessions = this.getData<CoachingSession>("sessions")
    return sessions.filter((s) => s.user_id === userId)
  }

  getSessionById(id: string): CoachingSession | null {
    const sessions = this.getData<CoachingSession>("sessions")
    return sessions.find((s) => s.id === id) || null
  }

  // Достижения
  createAchievement(achievementData: Omit<Achievement, "id" | "earned_at">): Achievement {
    const achievements = this.getData<Achievement>("achievements")

    // Проверяем, есть ли уже такое достижение
    const existing = achievements.find(
      (a) => a.user_id === achievementData.user_id && a.title === achievementData.title,
    )
    if (existing) return existing

    const achievement: Achievement = {
      id: this.generateId(),
      ...achievementData,
      earned_at: new Date().toISOString(),
    }

    achievements.push(achievement)
    this.setData("achievements", achievements)
    return achievement
  }

  getAchievements(userId: string): Achievement[] {
    const achievements = this.getData<Achievement>("achievements")
    return achievements.filter((a) => a.user_id === userId)
  }

  // Аналитика
  getAnalytics(userId: string): Analytics {
    const goals = this.getGoals(userId)
    const sessions = this.getSessions(userId)

    const activeGoals = goals.filter((g) => g.status === "active")
    const completedGoals = goals.filter((g) => g.status === "completed")

    const avgProgress =
      activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length) : 0

    const avgRating =
      sessions.length > 0 ? Math.round((sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length) * 10) / 10 : 0

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalSessions: sessions.length,
      avgProgress,
      avgRating,
    }
  }

  // Сессии пользователей
  setCurrentUser(userId: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("neurocoach_current_user", userId)
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  }

  getCurrentUser(): string | null {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem("neurocoach_current_user")
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  logout(): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("neurocoach_current_user")
      // Очищаем cookie для middleware
      document.cookie = "neurocoach_authenticated=false; path=/"
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  // Создание демо-данных (только для демо-аккаунта)
  private createDemoData(userId: string): void {
    // Создаем демо-цели
    const demoGoals = [
      {
        title: "Изучить новый язык программирования",
        description: "Освоить Python для анализа данных",
        category: "Образование",
        priority: "high" as const,
        status: "active" as const,
        progress: 30,
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Улучшить физическую форму",
        description: "Заниматься спортом 3 раза в неделю",
        category: "Здоровье",
        priority: "medium" as const,
        status: "active" as const,
        progress: 60,
        target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Прочитать 12 книг за год",
        description: "Развивать кругозор через чтение",
        category: "Личностный рост",
        priority: "low" as const,
        status: "active" as const,
        progress: 25,
        target_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    demoGoals.forEach((goalData) => {
      const goal = this.createGoal(userId, goalData)

      // Создаем подцели
      if (goal.title.includes("язык программирования")) {
        this.createSubgoal(goal.id, "Изучить основы синтаксиса")
        this.createSubgoal(goal.id, "Создать первый проект")
        this.createSubgoal(goal.id, "Пройти онлайн-курс")
      }
    })

    // Создаем демо-сессии
    const demoSessions = [
      {
        session_type: "goal-planning",
        title: "Планирование недели",
        content: "Обсудили приоритеты и составили план на неделю",
        insights: ["Важно фокусироваться на одной цели за раз", "Планирование помогает избежать прокрастинации"],
        rating: 5,
        duration: 45,
      },
      {
        session_type: "motivation",
        title: "Работа с мотивацией",
        content: "Разобрали техники поддержания мотивации",
        insights: ["Визуализация результата повышает мотивацию", "Маленькие победы важны для долгосрочного успеха"],
        rating: 4,
        duration: 30,
      },
    ]

    demoSessions.forEach((sessionData) => {
      this.createSession(userId, sessionData)
    })

    // Создаем демо-достижения
    this.createAchievement({
      user_id: userId,
      title: "Первые шаги",
      description: "Добро пожаловать в NeuroCoach!",
      icon: "🎯",
    })
  }

  // Инициализация демо-аккаунта
  initializeDemoAccount(): void {
    const demoEmail = "demo@neurocoach.com"
    const existingUser = this.getUserByEmail(demoEmail)

    if (!existingUser) {
      // Создаем демо-аккаунт с демо-данными
      this.createUser(demoEmail, "demo123", "Демо Пользователь", true)
    }
  }
}

// Экспортируем экземпляр базы данных
export const db = new LocalDatabase()

// Инициализируем демо-аккаунт при загрузке
if (typeof window !== "undefined") {
  db.initializeDemoAccount()
}
