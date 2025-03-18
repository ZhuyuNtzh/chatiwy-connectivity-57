
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email?: string
          role: string
          gender?: string
          age?: number
          location?: string
          interests?: string[]
          is_online: boolean
          last_active?: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string
          role?: string
          gender?: string
          age?: number
          location?: string
          interests?: string[]
          is_online?: boolean
          last_active?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: string
          gender?: string
          age?: number
          location?: string
          interests?: string[]
          is_online?: boolean
          last_active?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_name: string
          content: string
          created_at: string
          is_read: boolean
          is_deleted: boolean
          reply_to_id?: string
          reply_text?: string
          is_image: boolean
          image_url?: string
          is_blurred?: boolean
          is_voice_message: boolean
          audio_url?: string
          translated_content?: string
          translated_language?: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_name: string
          content: string
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to_id?: string
          reply_text?: string
          is_image?: boolean
          image_url?: string
          is_blurred?: boolean
          is_voice_message?: boolean
          audio_url?: string
          translated_content?: string
          translated_language?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          sender_name?: string
          content?: string
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to_id?: string
          reply_text?: string
          is_image?: boolean
          image_url?: string
          is_blurred?: boolean
          is_voice_message?: boolean
          audio_url?: string
          translated_content?: string
          translated_language?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      user_reports: {
        Row: {
          id: string
          reporter_id: string
          reporter_name: string
          reported_id: string
          reported_name: string
          reason: string
          details?: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reporter_name: string
          reported_id: string
          reported_name: string
          reason: string
          details?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reporter_name?: string
          reported_id?: string
          reported_name?: string
          reason?: string
          details?: string
          status?: string
          created_at?: string
        }
      }
      banned_words: {
        Row: {
          id: string
          word: string
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
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
