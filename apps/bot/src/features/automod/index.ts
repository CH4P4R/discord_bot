import type { Feature } from "../../core/feature";
import { logServiceFactory } from "../../services/logService";

const bannedWords = ["kufur", "hakaret", "lanet", "orospu", "pic", "salak"];
const inviteRegex = /discord\.gg\//i;
const urlRegex = /(https?:\/\/[^\s]+)/gi;

const feature: Feature = {
  name: "automod",
  description: "Kufur, spam ve istenmeyen linkleri engeller, raid korumasi sunar.",
  enabled: true,
  init(client) {
    const logService = logServiceFactory(client);
    const spamTracker = new Map<string, { count: number; lastTimestamp: number }>();
    const joinTracker = new Map<string, number[]>();

    client.on("guildMemberAdd", (member) => {
      const now = Date.now();
      const entries = joinTracker.get(member.guild.id) ?? [];
      const updated = entries.filter((ts) => now - ts < 60_000);
      updated.push(now);
      joinTracker.set(member.guild.id, updated);

      if (updated.length >= 6) {
        const channelId = client.config.guild.logChannelId;
        if (channelId) {
          const channel = member.guild.channels.cache.get(channelId);
          if (channel?.isTextBased()) {
            const warning = "[UYARI] Olasi raid tespit edildi. Son 60 saniyede " +
              updated.length +
              " kullanici katildi. Yonetim dikkat!";
            channel.send(warning).catch(() => null);
          }
        }
      }
    });

    client.on("messageCreate", async (message) => {
      if (!message.inGuild() || message.author.bot) return;

      const content = message.content.toLowerCase();
      const hasBannedWord = bannedWords.some((word) => content.includes(word));
      const hasInvite = inviteRegex.test(content);
      const hasUrl = urlRegex.test(content);

      const now = Date.now();
      const spamEntry = spamTracker.get(message.author.id) ?? { count: 0, lastTimestamp: now };
      const delta = now - spamEntry.lastTimestamp;
      spamEntry.count = delta < 5000 ? spamEntry.count + 1 : 1;
      spamEntry.lastTimestamp = now;
      spamTracker.set(message.author.id, spamEntry);

      const isSpam = spamEntry.count >= 5 && delta < 5000;

      if (hasBannedWord || hasInvite || (hasUrl && !message.member?.permissions.has("ManageMessages")) || isSpam) {
        await message.delete().catch(() => null);

        await logService.log({
          action: "automod_delete",
          userId: message.author.id,
          reason: hasBannedWord
            ? "Kufur filtresi"
            : hasInvite
              ? "Davet linki engellendi"
              : isSpam
                ? "Spam tespit edildi"
                : "Link engeli",
          metadata: { message: message.content }
        });

        await message.channel
          .send({
            content: message.author.toString() +
              ", mesajin otomatik moderasyon filtremize takildi. Lutfen kurallarimizi okuyun.",
            allowedMentions: { users: [message.author.id] }
          })
          .catch(() => null);
      }
    });
  }
};

export default feature;
