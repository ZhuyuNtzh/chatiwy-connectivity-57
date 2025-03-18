
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
      banned_ip: {
        Row: {
          id: number
          created_at: string
          ip_address: string | null
          reason: string | null
          banned_until: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          ip_address?: string | null
          reason?: string | null
          banned_until?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          ip_address?: string | null
          reason?: string | null
          banned_until?: string | null
        }
      }
      banned_nickname: {
        Row: {
          id: number
          created_at: string
          banned_pattern: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          banned_pattern?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          banned_pattern?: string | null
        }
      }
      bot: {
        Row: {
          id: number
          created_at: string
          bot_name: string | null
          description: string | null
          created_by: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          bot_name?: string | null
          description?: string | null
          created_by?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          bot_name?: string | null
          description?: string | null
          created_by?: number | null
        }
      }
      daily_image_upload: {
        Row: {
          id: number
          created_at: string
          ip_address: string | null
          count: number | null
          date: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          ip_address?: string | null
          count?: number | null
          date?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          ip_address?: string | null
          count?: number | null
          date?: string | null
        }
      }
      image: {
        Row: {
          id: number
          created_at: string
          blob_url: string | null
          ip_address: string | null
          uploaded_at: string | null
          message_id: number | null
          uploaded_by: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          blob_url?: string | null
          ip_address?: string | null
          uploaded_at?: string | null
          message_id?: number | null
          uploaded_by?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          blob_url?: string | null
          ip_address?: string | null
          uploaded_at?: string | null
          message_id?: number | null
          uploaded_by?: number | null
        }
      }
      interest: {
        Row: {
          id: number
          created_at: string
          name: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          name?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          name?: string | null
        }
      }
      login_attempt: {
        Row: {
          id: number
          created_at: string
          login_attempt: number | null
          ip_address: string | null
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          login_attempt?: number | null
          ip_address?: string | null
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          login_attempt?: number | null
          ip_address?: string | null
          timestamp?: string | null
          user_id?: number | null
        }
      }
      message: {
        Row: {
          id: number
          created_at: string
          content: string | null
          content_type: string | null
          sent_at: string | null
          status: string | null
          expires_at: string | null
          is_link: boolean | null
          voice_duration: number | null
          sender_id: number | null
          receiver_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          content?: string | null
          content_type?: string | null
          sent_at?: string | null
          status?: string | null
          expires_at?: string | null
          is_link?: boolean | null
          voice_duration?: number | null
          sender_id?: number | null
          receiver_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          content?: string | null
          content_type?: string | null
          sent_at?: string | null
          status?: string | null
          expires_at?: string | null
          is_link?: boolean | null
          voice_duration?: number | null
          sender_id?: number | null
          receiver_id?: number | null
        }
      }
      moderation_log: {
        Row: {
          id: number
          created_at: string
          target_ip: string | null
          action: string | null
          reason: string | null
          timestamp: string | null
          moderator_id: number | null
          target_user_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          target_ip?: string | null
          action?: string | null
          reason?: string | null
          timestamp?: string | null
          moderator_id?: number | null
          target_user_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          target_ip?: string | null
          action?: string | null
          reason?: string | null
          timestamp?: string | null
          moderator_id?: number | null
          target_user_id?: number | null
        }
      }
      profile: {
        Row: {
          id: number
          created_at: string
          bio: string | null
          location: string | null
          age: number | null
          gender: string | null
          user_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          bio?: string | null
          location?: string | null
          age?: number | null
          gender?: string | null
          user_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          bio?: string | null
          location?: string | null
          age?: number | null
          gender?: string | null
          user_id?: number | null
        }
      }
      reaction: {
        Row: {
          id: number
          created_at: string
          emoji: string | null
          timestamp: string | null
          message_id: number | null
          user_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          emoji?: string | null
          timestamp?: string | null
          message_id?: number | null
          user_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          emoji?: string | null
          timestamp?: string | null
          message_id?: number | null
          user_id?: number | null
        }
      }
      reply: {
        Row: {
          id: number
          created_at: string
          original_message_id: number | null
          reply_message_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          original_message_id?: number | null
          reply_message_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          original_message_id?: number | null
          reply_message_id?: number | null
        }
      }
      report: {
        Row: {
          id: number
          created_at: string
          reason: string | null
          timestamp: string | null
          reporter_user_id: number | null
          reported_user_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          reason?: string | null
          timestamp?: string | null
          reporter_user_id?: number | null
          reported_user_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          reason?: string | null
          timestamp?: string | null
          reporter_user_id?: number | null
          reported_user_id?: number | null
        }
      }
      site_setting: {
        Row: {
          id: number
          created_at: string
          key: string | null
          value: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          key?: string | null
          value?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          key?: string | null
          value?: string | null
        }
      }
      subscription: {
        Row: {
          id: number
          created_at: string
          plan_name: string | null
          price: number | null
          duration_days: number | null
          features: string | null
          max_interests: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          plan_name?: string | null
          price?: number | null
          duration_days?: number | null
          features?: string | null
          max_interests?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          plan_name?: string | null
          price?: number | null
          duration_days?: number | null
          features?: string | null
          max_interests?: number | null
        }
      }
      user: {
        Row: {
          id: number
          created_at: string
          name: string | null
          email: string | null
          password: string | null
          user_type: string | null
          nickname: string | null
          password_hash: string | null
          avatar_url: string | null
          is_online: boolean | null
          last_activity: string | null
          ip_address: string | null
          session_token: string | null
          visibility: string | null
          expires_at: string | null
          voice_message_url: string | null
          is_typing: boolean | null
          active_connections: number | null
          subscription_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          name?: string | null
          email?: string | null
          password?: string | null
          user_type?: string | null
          nickname?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          is_online?: boolean | null
          last_activity?: string | null
          ip_address?: string | null
          session_token?: string | null
          visibility?: string | null
          expires_at?: string | null
          voice_message_url?: string | null
          is_typing?: boolean | null
          active_connections?: number | null
          subscription_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          name?: string | null
          email?: string | null
          password?: string | null
          user_type?: string | null
          nickname?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          is_online?: boolean | null
          last_activity?: string | null
          ip_address?: string | null
          session_token?: string | null
          visibility?: string | null
          expires_at?: string | null
          voice_message_url?: string | null
          is_typing?: boolean | null
          active_connections?: number | null
          subscription_id?: number | null
        }
      }
      user_interest: {
        Row: {
          id: number
          created_at: string
          user_id: number | null
          interest_id: number | null
        }
        Insert: {
          id?: never
          created_at?: string
          user_id?: number | null
          interest_id?: number | null
        }
        Update: {
          id?: never
          created_at?: string
          user_id?: number | null
          interest_id?: number | null
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
