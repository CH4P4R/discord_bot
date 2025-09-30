export interface ActivityMetric {
  guild_id: string;
  message_count: number;
  voice_minutes: number;
  captured_at: string;
}

export interface XpEntry {
  user_id: string;
  xp: number;
  level: number;
  last_message_at?: string | null;
  last_voice_at?: string | null;
}

export interface StreamRecord {
  id: number;
  platform: string;
  channel_name: string;
  is_live: boolean;
  last_notified: string | null;
}

export interface SurveyRecord {
  id: number;
  question: string;
  options: string[];
  votes: Record<string, number>;
  created_at: string;
  message_id?: string | null;
  channel_id?: string | null;
}

export interface GithubEventRecord {
  id: number;
  repo: string;
  event_type: string;
  payload: Record<string, unknown>;
  notified: boolean;
  created_at: string;
}

export type LeaderboardEntry = Pick<XpEntry, "user_id" | "xp" | "level">;
