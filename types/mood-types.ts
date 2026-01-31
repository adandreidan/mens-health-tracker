// Daily Mood Check-In Type Definitions

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  moodScore: number; // 1-5 scale (1 = very bad, 5 = very good)
  note?: string; // Optional note, max 200 characters
  createdAt: string; // ISO timestamp for sorting
}

export type TrendDirection = 'up' | 'down' | 'flat';

export interface MoodInsights {
  sevenDayAverage: number;
  thirtyDayAverage: number;
  trend: TrendDirection;
  trendMessage: string;
}
