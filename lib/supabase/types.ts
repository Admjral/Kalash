export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          timezone: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          priority: "low" | "medium" | "high"
          progress: number
          status: "active" | "completed" | "paused"
          deadline: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          priority?: "low" | "medium" | "high"
          progress?: number
          status?: "active" | "completed" | "paused"
          deadline?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          priority?: "low" | "medium" | "high"
          progress?: number
          status?: "active" | "completed" | "paused"
          deadline?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      subgoals: {
        Row: {
          id: string
          goal_id: string
          title: string
          description: string | null
          status: "not_started" | "in_progress" | "completed"
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          description?: string | null
          status?: "not_started" | "in_progress" | "completed"
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          description?: string | null
          status?: "not_started" | "in_progress" | "completed"
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
          title: string | null
          messages: any[]
          insights: any | null
          goals_discussed: string[] | null
          session_rating: number | null
          duration_minutes: number | null
          status: "active" | "completed" | "cancelled"
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
          title?: string | null
          messages?: any[]
          insights?: any | null
          goals_discussed?: string[] | null
          session_rating?: number | null
          duration_minutes?: number | null
          status?: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
          title?: string | null
          messages?: any[]
          insights?: any | null
          goals_discussed?: string[] | null
          session_rating?: number | null
          duration_minutes?: number | null
          status?: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: "goal_completed" | "milestone_reached" | "streak_achieved" | "session_completed"
          title: string
          description: string
          icon: string | null
          points: number
          goal_id: string | null
          session_id: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "goal_completed" | "milestone_reached" | "streak_achieved" | "session_completed"
          title: string
          description: string
          icon?: string | null
          points?: number
          goal_id?: string | null
          session_id?: string | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "goal_completed" | "milestone_reached" | "streak_achieved" | "session_completed"
          title?: string
          description?: string
          icon?: string | null
          points?: number
          goal_id?: string | null
          session_id?: string | null
          metadata?: any | null
          created_at?: string
        }
      }
      goal_events: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          reminder_minutes: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          reminder_minutes?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          reminder_minutes?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          metric_type: string
          metric_value: number
          metadata: any | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: string
          metric_value: number
          metadata?: any | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: string
          metric_value?: number
          metadata?: any | null
          recorded_at?: string
          created_at?: string
        }
      }
    }
  }
}

export type Goal = Database["public"]["Tables"]["goals"]["Row"]
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"]
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"]

export type Subgoal = Database["public"]["Tables"]["subgoals"]["Row"]
export type SubgoalInsert = Database["public"]["Tables"]["subgoals"]["Insert"]
export type SubgoalUpdate = Database["public"]["Tables"]["subgoals"]["Update"]

export type CoachingSession = Database["public"]["Tables"]["coaching_sessions"]["Row"]
export type CoachingSessionInsert = Database["public"]["Tables"]["coaching_sessions"]["Insert"]
export type CoachingSessionUpdate = Database["public"]["Tables"]["coaching_sessions"]["Update"]

export type Achievement = Database["public"]["Tables"]["achievements"]["Row"]
export type AchievementInsert = Database["public"]["Tables"]["achievements"]["Insert"]

export type GoalEvent = Database["public"]["Tables"]["goal_events"]["Row"]
export type GoalEventInsert = Database["public"]["Tables"]["goal_events"]["Insert"]
export type GoalEventUpdate = Database["public"]["Tables"]["goal_events"]["Update"]

export type Analytics = Database["public"]["Tables"]["analytics"]["Row"]
export type AnalyticsInsert = Database["public"]["Tables"]["analytics"]["Insert"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
