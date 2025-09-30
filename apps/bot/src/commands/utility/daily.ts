import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "daily",
  category: "utility",
  cooldown: 60,
  data: new SlashCommandBuilder().setName("daily").setDescription("Günlük ödülünü al"),
  async execute({ interaction, client }) {
    const rewardXp = 250;
    const result = await client.services.levels.addMessageXp(interaction.user.id, interaction.user.tag, rewardXp);

    await interaction.reply({
      content: `?? Günlük ödülün: **${rewardXp} XP**! Toplam XP: **${result.newXp}**`
    });
  }
};

export default command;
