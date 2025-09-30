import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "avatar",
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Bir kullan�c�n�n avatar�n� g�sterir.")
    .addUserOption((option) => option.setName("kullanici").setDescription("Avatar� g�r�nt�lenecek ki�i")),
  async execute({ interaction }) {
    const target = interaction.options.getUser("kullanici") ?? interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${target.username} kullan�c�s�n�n avatar�`)
      .setImage(target.displayAvatarURL({ size: 1024 }))
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
