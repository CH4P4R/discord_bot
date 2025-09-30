import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "kick",
  category: "moderation",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Belirtilen kullaniciyi sunucudan atar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) => option.setName("kullanici").setDescription("Atilacak kullanici").setRequired(true))
    .addStringOption((option) => option.setName("sebep").setDescription("Atma sebebi")),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut sadece sunucuda calisir.", ephemeral: true });
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

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({ content: "Bu komut icin yetkin yok.", ephemeral: true });
      return;
    }

    try {
      await targetMember.kick(reason);
      await interaction.reply({ content: `${targetUser.tag} sunucudan atildi.` });

      await client.services.logs.log({
        action: "kick",
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        reason
      });
    } catch (error) {
      client.logger.error("Kick command failed", error as Error);
      await interaction.reply({ content: "Kullanici atilamadi.", ephemeral: true });
    }
  }
};

export default command;
