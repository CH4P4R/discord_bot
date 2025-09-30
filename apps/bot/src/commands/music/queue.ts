import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "queue",
  category: "music",
  guildOnly: true,
  data: new SlashCommandBuilder().setName("queue").setDescription("Aktif �alma s�ras�n� g�ster"),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    const queue = client.services.music.getQueue(interaction.guildId!);
    if (!queue || queue.tracks.length === 0) {
      await interaction.reply({ content: "Aktif �ark� yok.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("CyberHub M�zik S�ras�")
      .setDescription(
        queue.tracks
          .map((track, index) => `${index === 0 ? "??" : `${index}.`} **${track.title}** � ${track.duration} _(isteyen: ${track.requestedBy})_`)
          .join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
