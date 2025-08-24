import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, CoachingSession } from "@/lib/supabase"

export class CoachingService {
  static async getUserSessions(supabase: SupabaseClient<Database>, userId: string): Promise<CoachingSession[]> {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch coaching sessions: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserSessions:", error)
      throw error
    }
  }

  static async createSession(
    supabase: SupabaseClient<Database>,
    sessionData: {
      user_id: string
      session_type: string
      messages?: any
      metadata?: any
    },
  ): Promise<CoachingSession> {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .insert([
          {
            ...sessionData,
            messages: sessionData.messages || [],
            metadata: sessionData.metadata || {},
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create coaching session: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in createSession:", error)
      throw error
    }
  }

  static async updateSession(
    supabase: SupabaseClient<Database>,
    sessionId: string,
    userId: string,
    updates: Partial<CoachingSession>,
  ): Promise<CoachingSession> {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .update(updates)
        .eq("id", sessionId)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update coaching session: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in updateSession:", error)
      throw error
    }
  }
}
