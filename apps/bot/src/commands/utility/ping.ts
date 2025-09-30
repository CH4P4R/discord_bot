import { SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "ping",
  category: "utility",
  data: new SlashCommandBuilder().setName("ping").setDescription("Botun gecikme süresini gösterir."),
  async execute({ interaction, client }) {
    const sent = await interaction.reply({ content: "Pong!", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`API gecikmesi: **${Math.round(client.ws.ping)}ms** | Bot gecikmesi: **${latency}ms**`);
  }
};

export default command;
