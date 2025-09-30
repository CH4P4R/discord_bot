import { EmbedBuilder } from "discord.js";
import type { Feature } from "../../core/feature";

const feature: Feature = {
  name: "logging",
  description: "Uye hareketlerini ve moderasyon aksiyonlarini Supabase ile log kanallarina kaydeder.",
  enabled: true,
  init(client) {
    const logService = client.services.logs;

    const welcomeChannelId = client.config.guild.welcomeChannelId;
    const goodbyeChannelId = client.config.guild.goodbyeChannelId;

    client.on("guildMemberAdd", async (member) => {
      if (welcomeChannelId) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (channel?.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle("CyberHub'a Hos Geldin!")
            .setDescription(`Merhaba ${member.toString()}! Siber guvenlik toplulugumuza katildigin icin tesekkurler.`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setColor(0x57f287)
            .setTimestamp(new Date());

          await channel.send({ embeds: [embed] });
        }
      }

      await client.supabase.from("users").upsert({
        discord_id: member.id,
        username: member.user.tag,
        join_date: member.joinedAt?.toISOString() ?? new Date().toISOString(),
        avatar_url: member.user.displayAvatarURL({ size: 256 })
      });

      await logService.log({
        action: "member_join",
        userId: member.id,
        metadata: { username: member.user.tag }
      });
    });

    client.on("guildMemberRemove", async (member) => {
      if (goodbyeChannelId) {
        const channel = member.guild.channels.cache.get(goodbyeChannelId);
        if (channel?.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle("Bir Uye Ayrildi")
            .setDescription(`${member.user?.tag ?? "Bir uye"} aramizdan ayrildi.`)
            .setColor(0xed4245)
            .setTimestamp(new Date());

          await channel.send({ embeds: [embed] });
        }
      }

      await logService.log({
        action: "member_leave",
        userId: member.id,
        metadata: { username: member.user?.tag }
      });
    });

    client.on("guildBanAdd", async (ban) => {
      await logService.log({
        action: "ban",
        userId: ban.user.id,
        metadata: { reason: ban.reason }
      });
    });

    client.on("guildBanRemove", async (ban) => {
      await logService.log({
        action: "unban",
        userId: ban.user.id
      });
    });
  }
};

export default feature;
