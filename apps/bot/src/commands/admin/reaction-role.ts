import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const command: SlashCommand = {
  name: "reactionrole",
  category: "admin",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Emoji tepkileriyle rol veren mesajlari yonetir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName("ekle")
        .setDescription("Reaction role ekle")
        .addChannelOption((option) =>
          option.setName("kanal").setDescription("Mesajin bulundugu kanal").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("mesaj_id").setDescription("Mesaj ID").setRequired(true)
        )
        .addStringOption((option) => option.setName("emoji").setDescription("Emoji").setRequired(true))
        .addRoleOption((option) => option.setName("rol").setDescription("Verilecek rol").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName("sil")
        .setDescription("Mevcut reaction role kaydini sil")
        .addStringOption((option) => option.setName("mesaj_id").setDescription("Mesaj ID").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("Emoji").setRequired(true))
    ),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnizca sunucuda calisir.", ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ekle") {
      const channelInput = interaction.options.getChannel("kanal", true);
      const messageId = interaction.options.getString("mesaj_id", true);
      const emoji = interaction.options.getString("emoji", true);
      const role = interaction.options.getRole("rol", true);

      if (!channelInput || !("messages" in channelInput)) {
        await interaction.reply({ content: "Metin kanali secmelisin.", ephemeral: true });
        return;
      }

      const message = await (channelInput as { messages: { fetch: (id: string) => Promise<unknown> } })
        .messages.fetch(messageId)
        .catch(() => null);
      if (!message || typeof message !== "object" || !("react" in message)) {
        await interaction.reply({ content: "Mesaj bulunamadi.", ephemeral: true });
        return;
      }

      const { error } = await client.supabase.from("reaction_roles").insert({
        message_id: messageId,
        emoji,
        role_id: role.id
      });

      if (error) {
        client.logger.error("Failed to insert reaction role", error);
        await interaction.reply({ content: "Supabase'e kaydedilemedi.", ephemeral: true });
        return;
      }

      await (message as { react: (emoji: string) => Promise<unknown> }).react(emoji).catch(() => null);
      await interaction.reply({ content: "Reaction role kaydedildi.", ephemeral: true });
      return;
    }

    if (subcommand === "sil") {
      const messageId = interaction.options.getString("mesaj_id", true);
      const emoji = interaction.options.getString("emoji", true);

      const { error } = await client.supabase
        .from("reaction_roles")
        .delete()
        .eq("message_id", messageId)
        .eq("emoji", emoji);

      if (error) {
        client.logger.error("Failed to delete reaction role", error);
        await interaction.reply({ content: "Kayit silinemedi.", ephemeral: true });
        return;
      }

      await interaction.reply({ content: "Reaction role kaydi silindi.", ephemeral: true });
    }
  }
};

export default command;
