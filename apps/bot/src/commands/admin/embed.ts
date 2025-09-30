import { PermissionFlagsBits, SlashCommandBuilder, type APIEmbed } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "embed",
  category: "admin",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("JSON formatinda bir embed mesaji gonderir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName("json")
        .setDescription("Discord embed JSON verisi")
        .setRequired(true)
        .setMaxLength(4000)
    )
    .addChannelOption((option) => option.setName("kanal").setDescription("Gonderilecek kanal")),
  async execute({ interaction }) {
    const payload = interaction.options.getString("json", true);
    const targetChannel = interaction.options.getChannel("kanal") ?? interaction.channel;

    if (!targetChannel || !("isTextBased" in targetChannel) || !targetChannel.isTextBased() || !("send" in targetChannel)) {
      await interaction.reply({ content: "Embed yalnizca metin tabanli kanallara gonderilebilir.", ephemeral: true });
      return;
    }

    let embed: APIEmbed;
    try {
      embed = JSON.parse(payload) as APIEmbed;
    } catch {
      await interaction.reply({ content: "Gecerli bir JSON girmelisin.", ephemeral: true });
      return;
    }

    await (targetChannel as { send: (payload: { embeds: APIEmbed[] }) => Promise<unknown> }).send({ embeds: [embed] });
    await interaction.reply({ content: "Embed mesaji gonderildi.", ephemeral: true });
  }
};

export default command;
