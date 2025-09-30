import type { CyberClient } from "../core/cyberClient";

interface LevelComputation {
  level: number;
  totalXp: number;
  nextLevelXp: number;
}

const xpForLevel = (level: number) => 5 * level * level + 50 * level + 100;

const calculateLevel = (totalXp: number): LevelComputation => {
  let xp = totalXp;
  let level = 0;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }
  return {
    level,
    totalXp,
    nextLevelXp: xpForLevel(level)
  };
};

export class LevelService {
  constructor(private readonly client: CyberClient) {}

  async ensureUserProfile(userId: string, username: string, avatarUrl?: string | null) {
    await this.client.supabase
      .from("users")
      .upsert({
        discord_id: userId,
        username,
        join_date: new Date().toISOString(),
        avatar_url: avatarUrl ?? null
      })
      .select("discord_id");
  }

  async addMessageXp(userId: string, username: string, amount: number) {
    return this.addXp(userId, username, amount, { field: "last_message_at", value: new Date().toISOString() });
  }

  async addVoiceXp(userId: string, username: string, amount: number) {
    return this.addXp(userId, username, amount, { field: "last_voice_at", value: new Date().toISOString() });
  }

  async getLeaderboard(limit = 10) {
    const { data, error } = await this.client.supabase
      .from("xp")
      .select("user_id, xp, level")
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) {
      this.client.logger.error("Failed to fetch leaderboard", error);
      return [];
    }

    return (data as { user_id: string; xp: number; level: number }[] | null) ?? [];
  }

  private async addXp(
    userId: string,
    username: string,
    amount: number,
    activityField: { field: "last_message_at" | "last_voice_at"; value: string }
  ) {
    const existingResult = (await this.client.supabase
      .from("xp")
      .select("xp, level")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()) as { data: { xp?: number; level?: number } | null; error: unknown };

    if (existingResult.error) {
      this.client.logger.error("Failed to read XP entry", existingResult.error as Error);
      return { levelUp: false, newLevel: 0, newXp: 0 };
    }

    const existing = existingResult.data ?? { xp: 0, level: 0 };

    const currentXp = existing.xp ?? 0;
    const newXp = currentXp + amount;
    const computed = calculateLevel(newXp);
    const levelUp = computed.level > (existing.level ?? 0);

    const { error: upsertError } = await this.client.supabase.from("xp").upsert({
      user_id: userId,
      xp: newXp,
      level: computed.level,
      [activityField.field]: activityField.value
    });

    if (upsertError) {
      this.client.logger.error("Failed to upsert XP entry", upsertError);
    }

    await this.ensureUserProfile(userId, username);

    return {
      levelUp,
      newLevel: computed.level,
      newXp,
      xpForNextLevel: computed.nextLevelXp
    };
  }
}

export const levelServiceFactory = (client: CyberClient) => new LevelService(client);
