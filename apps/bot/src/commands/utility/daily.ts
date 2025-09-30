import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "daily",
  category: "utility",
  cooldown: 60,
  data: new SlashCommandBuilder().setName("daily").setDescription("G�nl�k �d�l�n� al"),
  async execute({ interaction, client }) {
    const rewardXp = 250;
    const result = await client.services.levels.addMessageXp(interaction.user.id, interaction.user.tag, rewardXp);

    await interaction.reply({
      content: `?? G�nl�k �d�l�n: **${rewardXp} XP**! Toplam XP: **${result.newXp}**`
    });
  }
};

export default command;
