import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "stop",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder().setName("stop").setDescription("�alma s�ras�n� temizle ve ba�lant�y� kapat"),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    try {
      await client.services.music.stop(interaction);
      await interaction.reply({ content: "?? M�zik durduruldu ve s�ra temizlendi." });
    } catch (error) {
      client.logger.error("Stop command failed", error as Error);
      await interaction.reply({ content: (error as Error).message ?? "Bir hata olu�tu.", ephemeral: true });
    }
  }
};

export default command;
