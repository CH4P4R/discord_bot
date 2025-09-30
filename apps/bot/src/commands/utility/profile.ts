import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "profil",
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Kullanýcýnýn topluluk profilini gösterir.")
    .addUserOption((option) => option.setName("kullanici").setDescription("Görüntülemek istediðin kullanýcý")),
  async execute({ interaction, client }) {
    const target = interaction.options.getUser("kullanici") ?? interaction.user;

    const { data: xpData, error } = await client.supabase
      .from("xp")
      .select("xp, level")
      .eq("user_id", target.id)
      .maybeSingle();

    if (error) {
      client.logger.error("Failed to fetch user XP", error);
    }

    const joinDate = interaction.guild?.members.cache.get(target.id)?.joinedAt;

    const embed = new EmbedBuilder()
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Seviye", value: String(xpData?.level ?? 0), inline: true },
        { name: "XP", value: String(xpData?.xp ?? 0), inline: true },
        {
          name: "Sunucuya Katýlým",
          value: joinDate ? `<t:${Math.floor(joinDate.getTime() / 1000)}:R>` : "Bilinmiyor",
          inline: true
        }
      )
      .setColor(0x5865f2)
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [embed], ephemeral: target.id !== interaction.user.id });
  }
};

export default command;
