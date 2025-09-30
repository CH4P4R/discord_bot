import { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "warn",
  category: "moderation",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Bir kullan�c�y� uyar�r ve kayda ge�er.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) => option.setName("kullanici").setDescription("Uyar�lacak kullan�c�").setRequired(true))
    .addStringOption((option) => option.setName("sebep").setDescription("Uyar� sebebi").setRequired(true)),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep", true);

    await client.services.logs.log({
      action: "warn",
      userId: target.id,
      moderatorId: interaction.user.id,
      reason
    });

    const dmEmbed = new EmbedBuilder()
      .setTitle("CyberHub Uyar�s�")
      .setDescription(`Sunucuda bir kural ihlali tespit edildi. Sebep: **${reason}**`)
      .setColor(0xfee75c)
      .setTimestamp(new Date());

    await target.send({ embeds: [dmEmbed] }).catch(() => null);

    await interaction.reply({ content: `${target.tag} uyar�ld�.`, ephemeral: true });
  }
};

export default command;
