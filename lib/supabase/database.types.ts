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
      exam_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer_ids: string[]
          session_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer_ids?: string[]
          session_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer_ids?: string[]
          session_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          correct_count: number
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json
          mode: string
          score_percent: number | null
          started_at: string
          total_questions: number
          user_id: string | null
          wrong_count: number
        }
        Insert: {
          completed_at?: string | null
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json
          mode: string
          score_percent?: number | null
          started_at?: string
          total_questions?: number
          user_id?: string | null
          wrong_count?: number
        }
        Update: {
          completed_at?: string | null
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json
          mode?: string
          score_percent?: number | null
          started_at?: string
          total_questions?: number
          user_id?: string | null
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_runs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          generated_count: number
          id: string
          invalid_count: number
          model: string
          prompt_version: string | null
          provider: string
          requested_count: number
          settings_id: string | null
          settings_snapshot: Json
          started_at: string
          status: string
          user_id: string | null
          valid_count: number
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          generated_count?: number
          id?: string
          invalid_count?: number
          model: string
          prompt_version?: string | null
          provider: string
          requested_count: number
          settings_id?: string | null
          settings_snapshot?: Json
          started_at?: string
          status?: string
          user_id?: string | null
          valid_count?: number
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          generated_count?: number
          id?: string
          invalid_count?: number
          model?: string
          prompt_version?: string | null
          provider?: string
          requested_count?: number
          settings_id?: string | null
          settings_snapshot?: Json
          started_at?: string
          status?: string
          user_id?: string | null
          valid_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "generation_runs_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "generation_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_settings: {
        Row: {
          constraints: Json
          created_at: string
          enable_ai_fact_checking: boolean
          generation_model: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          provider: string
          updated_at: string
          user_id: string
          validation_model: string | null
        }
        Insert: {
          constraints?: Json
          created_at?: string
          enable_ai_fact_checking?: boolean
          generation_model: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          provider?: string
          updated_at?: string
          user_id: string
          validation_model?: string | null
        }
        Update: {
          constraints?: Json
          created_at?: string
          enable_ai_fact_checking?: boolean
          generation_model?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          provider?: string
          updated_at?: string
          user_id?: string
          validation_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_id: string
          option_text: string
          question_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_id: string
          option_text: string
          question_id: string
          sort_order: number
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_id?: string
          option_text?: string
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_reports: {
        Row: {
          created_at: string
          id: string
          note: string
          question_id: string
          reason: string
          resolved_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          question_id: string
          reason: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          question_id?: string
          reason?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          confidence_score: number | null
          correct_answer_ids: string[]
          created_at: string
          difficulty: string
          domain: string
          explanation: string
          external_key: string | null
          hallucination_risk: string
          id: string
          is_active: boolean
          mastery_status: string
          memory_hook: string
          owner_user_id: string | null
          quality_score: number | null
          question_text: string
          question_type: string
          select_count: number
          source_basis: string
          source_kind: string
          tags: string[]
          times_correct: number
          times_seen: number
          times_wrong: number
          topic: string
          updated_at: string
          validation_status: string
          why_wrong_options_are_wrong: Json
        }
        Insert: {
          confidence_score?: number | null
          correct_answer_ids: string[]
          created_at?: string
          difficulty: string
          domain: string
          explanation: string
          external_key?: string | null
          hallucination_risk?: string
          id?: string
          is_active?: boolean
          mastery_status?: string
          memory_hook: string
          owner_user_id?: string | null
          quality_score?: number | null
          question_text: string
          question_type: string
          select_count: number
          source_basis: string
          source_kind?: string
          tags?: string[]
          times_correct?: number
          times_seen?: number
          times_wrong?: number
          topic: string
          updated_at?: string
          validation_status?: string
          why_wrong_options_are_wrong?: Json
        }
        Update: {
          confidence_score?: number | null
          correct_answer_ids?: string[]
          created_at?: string
          difficulty?: string
          domain?: string
          explanation?: string
          external_key?: string | null
          hallucination_risk?: string
          id?: string
          is_active?: boolean
          mastery_status?: string
          memory_hook?: string
          owner_user_id?: string | null
          quality_score?: number | null
          question_text?: string
          question_type?: string
          select_count?: number
          source_basis?: string
          source_kind?: string
          tags?: string[]
          times_correct?: number
          times_seen?: number
          times_wrong?: number
          topic?: string
          updated_at?: string
          validation_status?: string
          why_wrong_options_are_wrong?: Json
        }
        Relationships: [
          {
            foreignKeyName: "questions_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_stats: {
        Row: {
          domain: string
          id: string
          times_correct: number
          times_seen: number
          times_wrong: number
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          domain: string
          id?: string
          times_correct?: number
          times_seen?: number
          times_wrong?: number
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          domain?: string
          id?: string
          times_correct?: number
          times_seen?: number
          times_wrong?: number
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

