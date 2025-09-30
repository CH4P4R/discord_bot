import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "stop",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder().setName("stop").setDescription("Çalma sýrasýný temizle ve baðlantýyý kapat"),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnýzca sunucuda çalýþýr.", ephemeral: true });
      return;
    }

    try {
      await client.services.music.stop(interaction);
      await interaction.reply({ content: "?? Müzik durduruldu ve sýra temizlendi." });
    } catch (error) {
      client.logger.error("Stop command failed", error as Error);
      await interaction.reply({ content: (error as Error).message ?? "Bir hata oluþtu.", ephemeral: true });
    }
  }
};

export default command;
