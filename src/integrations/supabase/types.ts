export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banned_ip: {
        Row: {
          banned_until: string | null
          created_at: string | null
          id: number
          ip_address: string | null
          reason: string | null
        }
        Insert: {
          banned_until?: string | null
          created_at?: string | null
          id?: never
          ip_address?: string | null
          reason?: string | null
        }
        Update: {
          banned_until?: string | null
          created_at?: string | null
          id?: never
          ip_address?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      banned_nickname: {
        Row: {
          banned_pattern: string | null
          created_at: string | null
          id: number
        }
        Insert: {
          banned_pattern?: string | null
          created_at?: string | null
          id?: never
        }
        Update: {
          banned_pattern?: string | null
          created_at?: string | null
          id?: never
        }
        Relationships: []
      }
      banned_words: {
        Row: {
          created_at: string
          id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot: {
        Row: {
          bot_name: string | null
          created_at: string | null
          created_by: number | null
          description: string | null
          id: number
        }
        Insert: {
          bot_name?: string | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          id?: never
        }
        Update: {
          bot_name?: string | null
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          id?: never
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_image_upload: {
        Row: {
          count: number | null
          created_at: string | null
          date: string | null
          id: number
          ip_address: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          date?: string | null
          id?: never
          ip_address?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          date?: string | null
          id?: never
          ip_address?: string | null
        }
        Relationships: []
      }
      image: {
        Row: {
          blob_url: string | null
          created_at: string | null
          id: number
          ip_address: string | null
          message_id: number | null
          uploaded_at: string | null
          uploaded_by: number | null
        }
        Insert: {
          blob_url?: string | null
          created_at?: string | null
          id?: never
          ip_address?: string | null
          message_id?: number | null
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Update: {
          blob_url?: string | null
          created_at?: string | null
          id?: never
          ip_address?: string | null
          message_id?: number | null
          uploaded_at?: string | null
          uploaded_by?: number | null
        }
        Relationships: []
      }
      interest: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string | null
        }
        Relationships: []
      }
      login_attempt: {
        Row: {
          created_at: string | null
          id: number
          ip_address: string | null
          login_attempt: number | null
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          ip_address?: string | null
          login_attempt?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          ip_address?: string | null
          login_attempt?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      message: {
        Row: {
          content: string | null
          content_type: string | null
          created_at: string | null
          expires_at: string | null
          id: number
          is_link: boolean | null
          receiver_id: number | null
          sender_id: number | null
          sent_at: string | null
          status: string | null
          voice_duration: number | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: never
          is_link?: boolean | null
          receiver_id?: number | null
          sender_id?: number | null
          sent_at?: string | null
          status?: string | null
          voice_duration?: number | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: never
          is_link?: boolean | null
          receiver_id?: number | null
          sender_id?: number | null
          sent_at?: string | null
          status?: string | null
          voice_duration?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          audio_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_blurred: boolean
          is_deleted: boolean
          is_image: boolean
          is_read: boolean
          is_voice_message: boolean
          reply_text: string | null
          reply_to_id: string | null
          sender_id: string
          sender_name: string
          translated_content: string | null
          translated_language: string | null
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_blurred?: boolean
          is_deleted?: boolean
          is_image?: boolean
          is_read?: boolean
          is_voice_message?: boolean
          reply_text?: string | null
          reply_to_id?: string | null
          sender_id: string
          sender_name: string
          translated_content?: string | null
          translated_language?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_blurred?: boolean
          is_deleted?: boolean
          is_image?: boolean
          is_read?: boolean
          is_voice_message?: boolean
          reply_text?: string | null
          reply_to_id?: string | null
          sender_id?: string
          sender_name?: string
          translated_content?: string | null
          translated_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_log: {
        Row: {
          action: string | null
          created_at: string | null
          id: number
          moderator_id: number | null
          reason: string | null
          target_ip: string | null
          target_user_id: number | null
          timestamp: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: never
          moderator_id?: number | null
          reason?: string | null
          target_ip?: string | null
          target_user_id?: number | null
          timestamp?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: never
          moderator_id?: number | null
          reason?: string | null
          target_ip?: string | null
          target_user_id?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string | null
          gender: string | null
          id: number
          location: string | null
          user_id: number | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id?: never
          location?: string | null
          user_id?: number | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id?: never
          location?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      reaction: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: number
          message_id: number | null
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: never
          message_id?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: never
          message_id?: number | null
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      reply: {
        Row: {
          created_at: string | null
          id: number
          original_message_id: number | null
          reply_message_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          original_message_id?: number | null
          reply_message_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          original_message_id?: number | null
          reply_message_id?: number | null
        }
        Relationships: []
      }
      report: {
        Row: {
          created_at: string | null
          id: number
          reason: string | null
          reported_user_id: number | null
          reporter_user_id: number | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          reason?: string | null
          reported_user_id?: number | null
          reporter_user_id?: number | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          reason?: string | null
          reported_user_id?: number | null
          reporter_user_id?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      site_setting: {
        Row: {
          created_at: string | null
          id: number
          key: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          key?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          key?: string | null
          value?: string | null
        }
        Relationships: []
      }
      subscription: {
        Row: {
          created_at: string | null
          duration_days: number | null
          features: string | null
          id: number
          max_interests: number | null
          plan_name: string | null
          price: number | null
        }
        Insert: {
          created_at?: string | null
          duration_days?: number | null
          features?: string | null
          id?: never
          max_interests?: number | null
          plan_name?: string | null
          price?: number | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number | null
          features?: string | null
          id?: never
          max_interests?: number | null
          plan_name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      user: {
        Row: {
          active_connections: number | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: number
          ip_address: string | null
          is_online: boolean | null
          is_typing: boolean | null
          last_activity: string | null
          name: string | null
          nickname: string | null
          password: string | null
          password_hash: string | null
          session_token: string | null
          subscription_id: number | null
          user_type: string | null
          visibility: string | null
          voice_message_url: string | null
        }
        Insert: {
          active_connections?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: never
          ip_address?: string | null
          is_online?: boolean | null
          is_typing?: boolean | null
          last_activity?: string | null
          name?: string | null
          nickname?: string | null
          password?: string | null
          password_hash?: string | null
          session_token?: string | null
          subscription_id?: number | null
          user_type?: string | null
          visibility?: string | null
          voice_message_url?: string | null
        }
        Update: {
          active_connections?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: never
          ip_address?: string | null
          is_online?: boolean | null
          is_typing?: boolean | null
          last_activity?: string | null
          name?: string | null
          nickname?: string | null
          password?: string | null
          password_hash?: string | null
          session_token?: string | null
          subscription_id?: number | null
          user_type?: string | null
          visibility?: string | null
          voice_message_url?: string | null
        }
        Relationships: []
      }
      user_interest: {
        Row: {
          created_at: string | null
          id: number
          interest_id: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          interest_id?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: never
          interest_id?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reported_name: string
          reporter_id: string
          reporter_name: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reported_name: string
          reporter_id: string
          reporter_name: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reported_name?: string
          reporter_id?: string
          reporter_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_online: boolean
          last_active: string | null
          location: string | null
          role: string
          username: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_online?: boolean
          last_active?: string | null
          location?: string | null
          role?: string
          username: string
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_online?: boolean
          last_active?: string | null
          location?: string | null
          role?: string
          username?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
