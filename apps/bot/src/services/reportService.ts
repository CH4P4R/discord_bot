import type { CyberClient } from "../core/cyberClient";

export interface ActivityReport {
  guildId: string;
  messageCount: number;
  voiceMinutes: number;
  generatedAt: string;
}

export interface LevelReportEntry {
  userId: string;
  username?: string | null;
  level: number;
  xp: number;
}

export class ReportService {
  constructor(private readonly client: CyberClient) {}

  async generateActivityReport(guildId: string, period: "weekly" | "monthly"): Promise<ActivityReport | null> {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    if (period === "weekly") {
      since.setDate(since.getDate() - 7);
    } else {
      since.setMonth(since.getMonth() - 1);
    }

    const { data, error } = await this.client.supabase
      .from("activity_metrics")
      .select("message_count, voice_minutes, captured_at")
      .eq("guild_id", guildId)
      .gte("captured_at", since.toISOString());

    if (error) {
      this.client.logger.error("Failed to fetch activity metrics", error);
      return null;
    }

    const totals = data?.reduce(
      (acc, metric) => {
        acc.messageCount += metric.message_count;
        acc.voiceMinutes += metric.voice_minutes;
        return acc;
      },
      { messageCount: 0, voiceMinutes: 0 }
    ) ?? { messageCount: 0, voiceMinutes: 0 };

    return {
      guildId,
      messageCount: totals.messageCount,
      voiceMinutes: totals.voiceMinutes,
      generatedAt: new Date().toISOString()
    };
  }

  async getTopMembers(limit: number): Promise<LevelReportEntry[]> {
    const { data, error } = await this.client.supabase
      .from("xp")
      .select("user_id, xp, level")
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) {
      this.client.logger.error("Failed to fetch top members", error);
      return [];
    }

    return data?.map((entry) => ({
      userId: entry.user_id,
      level: entry.level,
      xp: entry.xp
    })) ?? [];
  }
}

export const reportServiceFactory = (client: CyberClient) => new ReportService(client);
