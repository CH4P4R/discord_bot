import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "skip",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder().setName("skip").setDescription("Sýradaki þarkýya geç"),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnýzca sunucuda çalýþýr.", ephemeral: true });
      return;
    }

    try {
      await client.services.music.skip(interaction);
      await interaction.reply({ content: "?? Sonraki þarkýya geçildi." });
    } catch (error) {
      client.logger.error("Skip command failed", error as Error);
      await interaction.reply({ content: (error as Error).message ?? "Aktif çalma listesi bulunamadý.", ephemeral: true });
    }
  }
};

export default command;
