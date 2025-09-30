import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const EMOJIS = ["??", "??", "??", "??", "??", "??", "??", "??", "??", "??"];

const command: SlashCommand = {
  name: "anket",
  category: "utility",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("anket")
    .setDescription("Sunucuda anket baþlatýr.")
    .addStringOption((option) => option.setName("soru").setDescription("Anket sorusu").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("secenekler")
        .setDescription("Seçenekleri | karakteri ile ayýr (ör: Seçenek 1 | Seçenek 2)")
        .setRequired(true)
    ),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnýzca sunucuda kullanýlabilir.", ephemeral: true });
      return;
    }

    const question = interaction.options.getString("soru", true);
    const options = interaction.options
      .getString("secenekler", true)
      .split("|")
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 2 || options.length > EMOJIS.length) {
      await interaction.reply({ content: `2 ile ${EMOJIS.length} arasýnda seçenek girmelisin.`, ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`??? ${question}`)
      .setDescription(options.map((option, index) => `${EMOJIS[index]} ${option}`).join("\n"))
      .setColor(0x5865f2)
      .setTimestamp(new Date());

    const message = await interaction.channel?.send({ embeds: [embed] });
    if (!message) {
      await interaction.reply({ content: "Anket oluþturulamadý.", ephemeral: true });
      return;
    }

    for (let index = 0; index < options.length; index += 1) {
      await message.react(EMOJIS[index]);
    }

    const { error } = await client.supabase.from("surveys").insert({
      question,
      options,
      votes: {},
      message_id: message.id,
      channel_id: message.channelId
    } as never);

    if (error) {
      client.logger.error("Failed to persist survey", error);
    }

    await interaction.reply({ content: "Anket oluþturuldu!", ephemeral: true });
  }
};

export default command;
