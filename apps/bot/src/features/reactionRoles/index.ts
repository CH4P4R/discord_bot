import type { Feature } from "../../core/feature";

interface ReactionRole {
  message_id: string;
  emoji: string;
  role_id: string;
}

const normaliseEmoji = (emoji: string) => emoji.replace(/<a?:|>/g, "");

const feature: Feature = {
  name: "reactionRoles",
  description: "Emoji tepkileriyle rol alma sistemini yonetir.",
  enabled: true,
  async init(client) {
    const cache = new Map<string, Map<string, string>>();

    const { data, error } = await client.supabase
      .from("reaction_roles")
      .select("message_id, emoji, role_id");

    if (error) {
      client.logger.error("Failed to fetch reaction roles", error);
    }

    const records = (data as ReactionRole[]) ?? [];
    records.forEach((entry) => {
      const messageCache = cache.get(entry.message_id) ?? new Map<string, string>();
      messageCache.set(normaliseEmoji(entry.emoji), entry.role_id);
      cache.set(entry.message_id, messageCache);
    });

    client.on("messageReactionAdd", async (reaction, user) => {
      if (user.bot || !reaction.message.inGuild()) return;
      const messageCache = cache.get(reaction.message.id);
      if (!messageCache) return;
      const emojiId = normaliseEmoji(reaction.emoji.identifier);
      const roleId = messageCache.get(emojiId);
      if (!roleId) return;

      const guildMember = await reaction.message.guild.members.fetch(user.id).catch(() => null);
      const role = reaction.message.guild.roles.cache.get(roleId);
      if (!guildMember || !role) return;

      await guildMember.roles.add(role, "Reaction role granted").catch((err) => {
        client.logger.error("Failed to grant reaction role", err);
      });
    });

    client.on("messageReactionRemove", async (reaction, user) => {
      if (user.bot || !reaction.message.inGuild()) return;
      const messageCache = cache.get(reaction.message.id);
      if (!messageCache) return;
      const emojiId = normaliseEmoji(reaction.emoji.identifier);
      const roleId = messageCache.get(emojiId);
      if (!roleId) return;

      const guildMember = await reaction.message.guild.members.fetch(user.id).catch(() => null);
      const role = reaction.message.guild.roles.cache.get(roleId);
      if (!guildMember || !role) return;

      await guildMember.roles.remove(role, "Reaction role removed").catch((err) => {
        client.logger.error("Failed to remove reaction role", err);
      });
    });
  }
};

export default feature;
