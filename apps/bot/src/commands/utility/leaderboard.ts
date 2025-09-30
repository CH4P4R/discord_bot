import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "leaderboard",
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("En aktif �yelerin XP s�ralamas�n� g�sterir.")
    .addIntegerOption((option) =>
      option.setName("limit").setDescription("G�sterilecek ki�i say�s�").setMinValue(3).setMaxValue(25)
    ),
  async execute({ interaction, client }) {
    const limit = interaction.options.getInteger("limit") ?? 10;
    const leaderboard = await client.services.levels.getLeaderboard(limit);

    if (!leaderboard.length) {
      await interaction.reply({ content: "Liderlik tablosu i�in yeterli veri yok.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("CyberHub Liderlik Tablosu")
      .setColor(0x5865f2)
      .setDescription(
        leaderboard
          .map((entry, index) => `${index + 1}. <@${entry.user_id}> � Seviye ${entry.level} � ${entry.xp} XP`)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
