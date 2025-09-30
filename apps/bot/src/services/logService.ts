import { EmbedBuilder, type Guild, type Snowflake, type APIEmbedField } from "discord.js";
import type { CyberClient } from "../core/cyberClient";

interface LogPayload {
  action: string;
  userId?: Snowflake | null;
  moderatorId?: Snowflake | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  guild?: Guild | null;
}

export class LogService {
  constructor(private readonly client: CyberClient) {}

  async log(payload: LogPayload) {
    const { action, userId, moderatorId, reason, metadata, guild } = payload;

    const { error } = await this.client.supabase.from("logs").insert({
      action,
      user_id: userId ?? null,
      moderator_id: moderatorId ?? null,
      reason: reason ?? null,
      metadata: metadata ?? null
    });

    if (error) {
      this.client.logger.error("Failed to insert log entry", error);
    }

    const channelId = this.client.config.guild.logChannelId;
    if (!channelId) return;
    const resolvedGuild = guild ?? this.client.guilds.cache.first();
    const channel = resolvedGuild?.channels.cache.get(channelId);

    if (channel && channel.isTextBased()) {
      const fields: APIEmbedField[] = [];
      if (userId) fields.push({ name: "Kullanýcý", value: `<@${userId}>`, inline: true });
      if (moderatorId) fields.push({ name: "Yetkili", value: `<@${moderatorId}>`, inline: true });
      if (reason) fields.push({ name: "Sebep", value: reason, inline: false });
      if (metadata && Object.keys(metadata).length > 0) {
        fields.push({ name: "Ek Bilgi", value: `\`\`${JSON.stringify(metadata, null, 2)}\`\`` });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Log: ${action}`)
        .setColor(0x5865f2)
        .setTimestamp(new Date())
        .setFooter({ text: "CyberHub Moderasyon" })
        .setFields(fields);

      await channel.send({ embeds: [embed] }).catch((err) => {
        this.client.logger.error("Failed to send log embed", err);
      });
    }
  }
}

export const logServiceFactory = (client: CyberClient) => new LogService(client);
