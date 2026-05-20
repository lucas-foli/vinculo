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
      profiles: {
        Row: { id: string; user_type: string | null; display_name: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; user_type?: string | null; display_name?: string | null; avatar_url?: string | null; created_at?: string }
        Update: { id?: string; user_type?: string | null; display_name?: string | null; avatar_url?: string | null; created_at?: string }
        Relationships: []
      }
      creators: {
        Row: { user_id: string; niche: string | null; sub_niches: string[]; platforms: string[]; audience_size_range: string | null; goals: string[]; bio: string | null; created_at: string }
        Insert: { user_id: string; niche?: string | null; sub_niches?: string[]; platforms?: string[]; audience_size_range?: string | null; goals?: string[]; bio?: string | null; created_at?: string }
        Update: { user_id?: string; niche?: string | null; sub_niches?: string[]; platforms?: string[]; audience_size_range?: string | null; goals?: string[]; bio?: string | null; created_at?: string }
        Relationships: []
      }
      agencies: {
        Row: { user_id: string; name: string; slug: string; logo_url: string | null; niches: string[]; services: string[]; description: string | null; website: string | null; featured: boolean; created_at: string }
        Insert: { user_id: string; name: string; slug: string; logo_url?: string | null; niches?: string[]; services?: string[]; description?: string | null; website?: string | null; featured?: boolean; created_at?: string }
        Update: { user_id?: string; name?: string; slug?: string; logo_url?: string | null; niches?: string[]; services?: string[]; description?: string | null; website?: string | null; featured?: boolean; created_at?: string }
        Relationships: []
      }
      matches: {
        Row: { id: string; creator_id: string; agency_id: string; score: number; reason: string; created_at: string }
        Insert: { id?: string; creator_id: string; agency_id: string; score: number; reason?: string; created_at?: string }
        Update: { id?: string; creator_id?: string; agency_id?: string; score?: number; reason?: string; created_at?: string }
        Relationships: []
      }
      threads: {
        Row: { id: string; creator_id: string; agency_id: string; created_at: string; last_message_at: string | null }
        Insert: { id?: string; creator_id: string; agency_id: string; created_at?: string; last_message_at?: string | null }
        Update: { id?: string; creator_id?: string; agency_id?: string; created_at?: string; last_message_at?: string | null }
        Relationships: []
      }
      messages: {
        Row: { id: string; thread_id: string; sender_id: string; content: string; created_at: string }
        Insert: { id?: string; thread_id: string; sender_id: string; content: string; created_at?: string }
        Update: { id?: string; thread_id?: string; sender_id?: string; content?: string; created_at?: string }
        Relationships: []
      }
      deals: {
        Row: { id: string; thread_id: string; estimated_value: number; commission_rate: number; status: string; created_at: string }
        Insert: { id?: string; thread_id: string; estimated_value?: number; commission_rate?: number; status?: string; created_at?: string }
        Update: { id?: string; thread_id?: string; estimated_value?: number; commission_rate?: number; status?: string; created_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
