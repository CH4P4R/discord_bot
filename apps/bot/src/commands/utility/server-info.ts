import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "sunucu",
  category: "utility",
  data: new SlashCommandBuilder().setName("sunucu").setDescription("Sunucu hakkinda genel bilgiler verir."),
  async execute({ interaction }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnizca sunucu icinde calisir.", ephemeral: true });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "Sunucu bilgisine ulasilamadi.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Sunucu Bilgileri`)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .addFields(
        { name: "Uye Sayisi", value: String(guild.memberCount), inline: true },
        { name: "Olusturulma", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Sahip", value: `<@${guild.ownerId}>`, inline: true }
      )
      .setColor(0x57f287)
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
