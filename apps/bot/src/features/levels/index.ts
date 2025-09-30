import type { Feature } from "../../core/feature";

const feature: Feature = {
  name: "levels",
  description: "Mesaj ve ses aktivitelerine göre XP verir, Supabase üzerinde liderlik tablosu tutar.",
  enabled: true,
  init(client) {
    const levelService = client.services.levels;
    const messageCooldown = new Map<string, number>();
    const voiceSessions = new Map<string, number>();

    client.on("messageCreate", async (message) => {
      if (message.author.bot || !message.inGuild()) return;

      const now = Date.now();
      const lastMessage = messageCooldown.get(message.author.id) ?? 0;
      if (now - lastMessage < client.config.xp.cooldownSeconds * 1000) return;
      messageCooldown.set(message.author.id, now);

      const xpResult = await levelService.addMessageXp(
        message.author.id,
        message.author.tag,
        client.config.xp.perMessage
      );

      if (xpResult.levelUp) {
        await message.channel.send({
          content: `?? ${message.author} seviye atladý! Yeni seviye: **${xpResult.newLevel}**`
        });
      }
    });

    client.on("voiceStateUpdate", async (oldState, newState) => {
      if (!newState.member || newState.member.user.bot) return;
      const userId = newState.member.id;

      if (!oldState.channelId && newState.channelId) {
        voiceSessions.set(userId, Date.now());
      }

      if (oldState.channelId && !newState.channelId) {
        const start = voiceSessions.get(userId);
        voiceSessions.delete(userId);
        if (!start) return;
        const durationMinutes = Math.floor((Date.now() - start) / 60000);
        if (durationMinutes <= 0) return;
        const xpAmount = durationMinutes * client.config.xp.perVoiceMinute;
        const xpResult = await levelService.addVoiceXp(userId, newState.member.user.tag, xpAmount);
        if (xpResult.levelUp && newState.guild.systemChannel) {
          await newState.guild.systemChannel.send({
            content: `??? <@${userId}> sesli kanallarda aktif olduðu için **${xpResult.newLevel}. seviyeye** yükseldi!`
          });
        }
      }
    });
  }
};

export default feature;
