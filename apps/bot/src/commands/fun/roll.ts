import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "zar",
  category: "fun",
  data: new SlashCommandBuilder()
    .setName("zar")
    .setDescription("Belirtilen zar türünü atar.")
    .addIntegerOption((option) =>
      option.setName("kenar").setDescription("Zar kenar sayýsý").setRequired(false).setMinValue(2).setMaxValue(100)
    ),
  async execute({ interaction }) {
    const sides = interaction.options.getInteger("kenar") ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply({ content: `?? ${sides} taraflý zarda sonuç: **${result}**` });
  }
};

export default command;
