export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          gratitudes: string[];
          mood: number;
          sentiment: 'positive' | 'neutral' | 'negative';
          keywords: string[];
          ai_insight: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          content?: string;
          gratitudes?: string[];
          mood?: number;
          sentiment?: 'positive' | 'neutral' | 'negative';
          keywords?: string[];
          ai_insight?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          content?: string;
          gratitudes?: string[];
          mood?: number;
          sentiment?: 'positive' | 'neutral' | 'negative';
          keywords?: string[];
          ai_insight?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_insights: {
        Row: {
          id: string;
          user_id: string;
          total_entries: number;
          average_mood: number;
          streak: number;
          common_themes: string[];
          sentiment_distribution: {
            positive: number;
            neutral: number;
            negative: number;
          };
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_entries?: number;
          average_mood?: number;
          streak?: number;
          common_themes?: string[];
          sentiment_distribution?: {
            positive: number;
            neutral: number;
            negative: number;
          };
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_entries?: number;
          average_mood?: number;
          streak?: number;
          common_themes?: string[];
          sentiment_distribution?: {
            positive: number;
            neutral: number;
            negative: number;
          };
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}