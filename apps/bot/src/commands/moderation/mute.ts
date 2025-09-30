import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "mute",
  category: "moderation",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Belirtilen kullaniciyi sureli susturur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) => option.setName("kullanici").setDescription("Susturulacak kullanici").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("sure").setDescription("Susturma suresi (dakika)").setMinValue(1).setMaxValue(10080).setRequired(true)
    )
    .addStringOption((option) => option.setName("sebep").setDescription("Sebep")),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut sadece sunucuda calisir.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("kullanici", true);
    const durationMinutes = interaction.options.getInteger("sure", true);
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

    try {
      await targetMember.timeout(durationMinutes * 60 * 1000, reason);
      await interaction.reply({ content: `${targetUser.tag} ${durationMinutes} dakika boyunca susturuldu.` });

      await client.services.logs.log({
        action: "mute",
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
        metadata: { durationMinutes }
      });
    } catch (error) {
      client.logger.error("Mute command failed", error as Error);
      await interaction.reply({ content: "Kullanici susturulamadi.", ephemeral: true });
    }
  }
};

export default command;
