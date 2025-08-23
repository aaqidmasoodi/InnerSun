export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  content: string;
  gratitudes: string[];
  mood: number; // 1-5 scale
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmotionalInsight {
  period: string;
  averageMood: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonThemes: string[];
  streak: number;
}

export interface ChartData {
  date: string;
  mood: number;
  sentiment: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
}