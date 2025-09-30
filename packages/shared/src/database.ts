export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          discord_id: string;
          username: string;
          join_date: string;
          avatar_url: string | null;
        };
        Insert: {
          discord_id: string;
          username: string;
          join_date: string;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      xp: {
        Row: {
          id: number;
          user_id: string;
          xp: number;
          level: number;
          last_message_at: string | null;
          last_voice_at: string | null;
        };
        Insert: {
          user_id: string;
          xp?: number;
          level?: number;
          last_message_at?: string | null;
          last_voice_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["xp"]["Row"]>;
        Relationships: [];
      };
      logs: {
        Row: {
          id: number;
          action: string;
          user_id: string | null;
          moderator_id: string | null;
          reason: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          action: string;
          user_id?: string | null;
          moderator_id?: string | null;
          reason?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["logs"]["Row"]>;
        Relationships: [];
      };
      streams: {
        Row: {
          id: number;
          platform: string;
          channel_name: string;
          is_live: boolean;
          last_notified: string | null;
        };
        Insert: {
          platform: string;
          channel_name: string;
          is_live?: boolean;
          last_notified?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["streams"]["Row"]>;
        Relationships: [];
      };
      surveys: {
        Row: {
          id: number;
          question: string;
          options: string[];
          votes: Record<string, number>;
          created_at: string;
          message_id: string | null;
          channel_id: string | null;
        };
        Insert: {
          question: string;
          options: string[];
          votes?: Record<string, number>;
          message_id?: string | null;
          channel_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["surveys"]["Row"]>;
        Relationships: [];
      };
      reaction_roles: {
        Row: {
          id: number;
          message_id: string;
          emoji: string;
          role_id: string;
        };
        Insert: {
          message_id: string;
          emoji: string;
          role_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reaction_roles"]["Row"]>;
        Relationships: [];
      };
      activity_metrics: {
        Row: {
          id: number;
          guild_id: string;
          message_count: number;
          voice_minutes: number;
          captured_at: string;
        };
        Insert: {
          guild_id: string;
          message_count: number;
          voice_minutes: number;
          captured_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_metrics"]["Row"]>;
        Relationships: [];
      };
      auto_responses: {
        Row: {
          id: number;
          trigger: string;
          response: string;
          match_type: "exact" | "contains" | "starts_with";
          is_embed: boolean;
        };
        Insert: {
          trigger: string;
          response: string;
          match_type: "exact" | "contains" | "starts_with";
          is_embed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["auto_responses"]["Row"]>;
        Relationships: [];
      };
      github_events: {
        Row: {
          id: number;
          repo: string;
          event_type: string;
          payload: Record<string, unknown>;
          notified: boolean;
          created_at: string;
        };
        Insert: {
          repo: string;
          event_type: string;
          payload: Record<string, unknown>;
          notified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["github_events"]["Row"]>;
        Relationships: [];
      };
      guild_settings: {
        Row: {
          id: number;
          guild_id: string;
          welcome_message: string | null;
          goodbye_message: string | null;
          rules_embed: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          guild_id: string;
          welcome_message?: string | null;
          goodbye_message?: string | null;
          rules_embed?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["guild_settings"]["Row"]>;
        Relationships: [];
      };
      music_settings: {
        Row: {
          id: number;
          guild_id: string;
          default_volume: number;
          dj_role_id: string | null;
          updated_at: string;
        };
        Insert: {
          guild_id: string;
          default_volume?: number;
          dj_role_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["music_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}
