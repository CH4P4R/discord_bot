import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "skip",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder().setName("skip").setDescription("S�radaki �ark�ya ge�"),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    try {
      await client.services.music.skip(interaction);
      await interaction.reply({ content: "?? Sonraki �ark�ya ge�ildi." });
    } catch (error) {
      client.logger.error("Skip command failed", error as Error);
      await interaction.reply({ content: (error as Error).message ?? "Aktif �alma listesi bulunamad�.", ephemeral: true });
    }
  }
};

export default command;
