import type { Feature } from "../../core/feature";

interface ActivitySnapshot {
  messageCount: number;
  voiceMinutes: number;
}

const feature: Feature = {
  name: "analytics",
  description: "Sunucu mesaj ve ses aktivite metriklerini Supabase'e yazar.",
  enabled: true,
  init(client) {
    const activity = new Map<string, ActivitySnapshot>();
    const voiceJoins = new Map<string, number>();

    const ensureActivity = (guildId: string) => {
      const existing = activity.get(guildId);
      if (existing) return existing;
      const snapshot: ActivitySnapshot = { messageCount: 0, voiceMinutes: 0 };
      activity.set(guildId, snapshot);
      return snapshot;
    };

    client.on("messageCreate", (message) => {
      if (!message.inGuild() || message.author.bot) return;
      const snapshot = ensureActivity(message.guild.id);
      snapshot.messageCount += 1;
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
      const guildId = newState.guild?.id ?? oldState.guild?.id;
      if (!guildId) return;
      const member = newState.member ?? oldState.member;
      if (!member || member.user.bot) return;

      if (!oldState.channelId && newState.channelId) {
        voiceJoins.set(member.id, Date.now());
      }

      if (oldState.channelId && !newState.channelId) {
        const start = voiceJoins.get(member.id);
        voiceJoins.delete(member.id);
        if (!start) return;
        const minutes = Math.max(Math.round((Date.now() - start) / 60000), 0);
        const snapshot = ensureActivity(guildId);
        snapshot.voiceMinutes += minutes;
      }
    });

    const flush = async () => {
      if (!activity.size) return;
      const payload = Array.from(activity.entries()).map(([guildId, snapshot]) => ({
        guild_id: guildId,
        message_count: snapshot.messageCount,
        voice_minutes: snapshot.voiceMinutes,
        captured_at: new Date().toISOString()
      }));

      activity.clear();

      const { error } = await client.supabase.from("activity_metrics").insert(payload as unknown as Record<string, unknown>[]);
      if (error) {
        client.logger.error("Failed to upsert activity metrics", error);
      }
    };

    setInterval(flush, 5 * 60 * 1000).unref();
  }
};

export default feature;
