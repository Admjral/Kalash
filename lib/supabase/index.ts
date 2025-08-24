export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          location: string | null
          birthdate: string | null
          timezone: string | null
          language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          birthdate?: string | null
          timezone?: string | null
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          birthdate?: string | null
          timezone?: string | null
          language?: string | null
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
          category: string
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
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
          title: string | null
          messages: Json
          insights: Json | null
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
          session_type: "goal-setting" | "progress-review" | "problem-solving" | "emotional-support"
          title?: string | null
          messages?: Json
          insights?: Json | null
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
          messages?: Json
          insights?: Json | null
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
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
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
          reminder_minutes: number | null
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
          reminder_minutes?: number | null
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
          reminder_minutes?: number | null
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
          metadata: Json | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: string
          metric_value: number
          metadata?: Json | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: string
          metric_value?: number
          metadata?: Json | null
          recorded_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Goal = Database["public"]["Tables"]["goals"]["Row"]
export type CoachingSession = Database["public"]["Tables"]["coaching_sessions"]["Row"]
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"]
export type GoalEvent = Database["public"]["Tables"]["goal_events"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
