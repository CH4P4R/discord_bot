import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "clear",
  category: "moderation",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Kanaldaki mesajlar� toplu olarak siler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("adet")
        .setDescription("Silinecek mesaj say�s�")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  async execute({ interaction }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("adet", true);
    const channel = interaction.channel;
    if (!channel?.isTextBased()) {
      await interaction.reply({ content: "Bu komut yaln�zca metin kanallar�nda kullan�labilir.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const deleted = await channel.bulkDelete(amount, true).catch(() => null);
    if (!deleted) {
      await interaction.editReply("Mesajlar silinirken bir hata olu�tu. 14 g�nden eski mesajlar silinemez.");
      return;
    }

    await interaction.editReply(`${deleted.size} mesaj silindi.`);
  }
};

export default command;
