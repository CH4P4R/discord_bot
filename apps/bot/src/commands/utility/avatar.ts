import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "avatar",
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Bir kullanýcýnýn avatarýný gösterir.")
    .addUserOption((option) => option.setName("kullanici").setDescription("Avatarý görüntülenecek kiþi")),
  async execute({ interaction }) {
    const target = interaction.options.getUser("kullanici") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${target.username} kullanýcýsýnýn avatarý`)
      .setImage(target.displayAvatarURL({ size: 1024 }))
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
