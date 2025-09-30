import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "ban",
  category: "moderation",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Belirtilen kullaniciyi sunucudan yasaklar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) => option.setName("kullanici").setDescription("Yasaklanacak kullanici").setRequired(true))
    .addStringOption((option) => option.setName("sebep").setDescription("Yasaklama sebebi")),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut sadece sunucuda kullanilabilir.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "Sunucu bilgisine ulasilamadi.", ephemeral: true });
      return;
    }

    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      await interaction.reply({ content: "Kullanici bulunamadi ya da sunucuda degil.", ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({ content: "Bu komutu kullanmak icin iznin yok.", ephemeral: true });
      return;
    }

    try {
      await targetMember.ban({ reason });
      await interaction.reply({ content: `${targetUser.tag} yasaklandi.` });

      await client.services.logs.log({
        action: "ban",
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        reason
      });
    } catch (error) {
      client.logger.error("Ban command failed", error as Error);
      await interaction.reply({ content: "Kullanici yasaklanamadi.", ephemeral: true });
    }
  }
};

export default command;
