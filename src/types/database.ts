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
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}