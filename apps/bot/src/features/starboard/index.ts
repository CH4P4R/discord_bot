import { EmbedBuilder } from "discord.js";
import type { Feature } from "../../core/feature";

const STAR_EMOJI = "?";
const THRESHOLD = 3;

const feature: Feature = {
  name: "starboard",
  description: "Topluluk tarafýndan beðenilen mesajlarý öne çýkarýr.",
  enabled: true,
  init(client) {
    const starboardChannelId = client.config.guild.announcementChannelId;
    if (!starboardChannelId) {
      client.logger.warn("Starboard için duyuru kanalý ayarlanmamýþ.");
      return;
    }

    client.on("messageReactionAdd", async (reaction) => {
      if (!reaction.message.inGuild()) return;
      if (reaction.emoji.name !== STAR_EMOJI) return;

      const count = reaction.count ?? 0;
      if (count < THRESHOLD) return;

      const channel = reaction.message.guild.channels.cache.get(starboardChannelId);
      if (!channel?.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setAuthor({ name: reaction.message.author?.tag ?? "Bilinmiyor" })
        .setDescription(reaction.message.content || "(Mesaj içeriði bulunamadý)")
        .setTimestamp(reaction.message.createdAt ?? new Date())
        .setColor(0xf1c40f)
        .setFooter({ text: `${count} ? | #${reaction.message.channel.name}` });

      if (reaction.message.attachments.size > 0) {
        const attachment = reaction.message.attachments.first();
        if (attachment?.contentType?.startsWith("image/")) {
          embed.setImage(attachment.url);
        }
      }

      await channel.send({ content: `? <#${reaction.message.channel.id}>`, embeds: [embed] }).catch((err) => {
        client.logger.error("Failed to send starboard message", err);
      });
    });
  }
};

export default feature;
