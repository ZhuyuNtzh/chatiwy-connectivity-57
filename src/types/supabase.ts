
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
          email: string | null
          avatar_url: string | null
          created_at: string
          role: 'standard' | 'vip' | 'admin'
          gender: string | null
          age: number | null
          location: string | null
          interests: string[] | null
          is_online: boolean
          last_active: string | null
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: 'standard' | 'vip' | 'admin'
          gender?: string | null
          age?: number | null
          location?: string | null
          interests?: string[] | null
          is_online?: boolean
          last_active?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: 'standard' | 'vip' | 'admin'
          gender?: string | null
          age?: number | null
          location?: string | null
          interests?: string[] | null
          is_online?: boolean
          last_active?: string | null
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
          conversation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          is_read: boolean
          is_deleted: boolean
          reply_to_id: string | null
          is_image: boolean
          image_url: string | null
          is_blurred: boolean
          is_voice_message: boolean
          audio_url: string | null
          translated_content: string | null
          translated_language: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to_id?: string | null
          is_image?: boolean
          image_url?: string | null
          is_blurred?: boolean
          is_voice_message?: boolean
          audio_url?: string | null
          translated_content?: string | null
          translated_language?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          is_read?: boolean
          is_deleted?: boolean
          reply_to_id?: string | null
          is_image?: boolean
          image_url?: string | null
          is_blurred?: boolean
          is_voice_message?: boolean
          audio_url?: string | null
          translated_content?: string | null
          translated_language?: string | null
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
          reported_id: string
          reason: string
          details: string | null
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
        }
      }
      banned_words: {
        Row: {
          id: string
          word: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          word: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          word?: string
          created_at?: string
          created_by?: string | null
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
