import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Profile } from "@/lib/supabase"

export class ProfilesService {
  static async getProfile(supabase: SupabaseClient<Database>, userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // Profile not found
        }
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in getProfile:", error)
      throw error
    }
  }

  static async updateProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
    updates: Partial<Profile>,
  ): Promise<Profile> {
    try {
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in updateProfile:", error)
      throw error
    }
  }
}
