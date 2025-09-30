import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "play",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Bir �ark�y� kuyru�a ekler ve �almaya ba�lar.")
    .addStringOption((option) => option.setName("arama").setDescription("YouTube/Spotify linki veya arama kelimesi").setRequired(true)),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const query = interaction.options.getString("arama", true);
      const track = await client.services.music.enqueue(interaction, query);
      await interaction.editReply(`?? Kuyru�a eklendi: **${track.title}** (${track.duration})`);
    } catch (error) {
      client.logger.error("Play command failed", error as Error);
      await interaction.editReply("�ark� �al�namad�. Ses kanal�nda oldu�undan emin ol.");
    }
  }
};

export default command;
