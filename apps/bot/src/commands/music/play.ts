import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "play",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Bir þarkýyý kuyruða ekler ve çalmaya baþlar.")
    .addStringOption((option) => option.setName("arama").setDescription("YouTube/Spotify linki veya arama kelimesi").setRequired(true)),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnýzca sunucuda çalýþýr.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const query = interaction.options.getString("arama", true);
      const track = await client.services.music.enqueue(interaction, query);
      await interaction.editReply(`?? Kuyruða eklendi: **${track.title}** (${track.duration})`);
    } catch (error) {
      client.logger.error("Play command failed", error as Error);
      await interaction.editReply("Þarký çalýnamadý. Ses kanalýnda olduðundan emin ol.");
    }
  }
};

export default command;
