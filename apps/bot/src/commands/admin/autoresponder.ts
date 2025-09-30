import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "../../typings/command";

const MATCH_TYPES = ["exact", "contains", "starts_with"] as const;

type MatchType = (typeof MATCH_TYPES)[number];

const isMatchType = (value: string): value is MatchType => MATCH_TYPES.includes(value as MatchType);

const command: SlashCommand = {
  name: "autoresponder",
  category: "admin",
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName("autoresponder")
    .setDescription("Otomatik yan�t tetikleyicilerini y�netir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("ekle")
        .setDescription("Yeni otomatik yan�t ekler")
        .addStringOption((option) => option.setName("tetik").setDescription("Tetikleyici metin").setRequired(true))
        .addStringOption((option) =>
          option
            .setName("yanit")
            .setDescription("Yan�t metni veya embed JSON")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("eslesme")
            .setDescription("E�le�me t�r� (exact | contains | starts_with)")
            .setChoices(
              { name: "Ayn� (exact)", value: "exact" },
              { name: "��eren (contains)", value: "contains" },
              { name: "Ba�layan (starts_with)", value: "starts_with" }
            )
        )
        .addBooleanOption((option) =>
          option.setName("embed").setDescription("Yan�t embed JSON olarak m� g�nderilecek?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("sil")
        .setDescription("Mevcut otomatik yan�t� sil")
        .addStringOption((option) => option.setName("tetik").setDescription("Tetikleyici").setRequired(true))
    ),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yaln�zca sunucuda �al���r.", ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ekle") {
      const trigger = interaction.options.getString("tetik", true);
      const response = interaction.options.getString("yanit", true);
      const matchType = interaction.options.getString("eslesme") ?? "contains";
      const isEmbed = interaction.options.getBoolean("embed") ?? false;

      if (!isMatchType(matchType)) {
        await interaction.reply({ content: "Ge�ersiz e�le�me t�r�.", ephemeral: true });
        return;
      }

      const { error } = await client.supabase.from("auto_responses").insert({
        trigger,
        response,
        match_type: matchType,
        is_embed: isEmbed
      });

      if (error) {
        client.logger.error("Failed to insert auto responder", error);
        await interaction.reply({ content: "Supabase'e kaydedilemedi.", ephemeral: true });
        return;
      }

      await interaction.reply({ content: "Otomatik yan�t eklendi.", ephemeral: true });
      return;
    }

    if (subcommand === "sil") {
      const trigger = interaction.options.getString("tetik", true);
      const { error } = await client.supabase
        .from("auto_responses")
        .delete()
        .eq("trigger", trigger);

      if (error) {
        client.logger.error("Failed to delete auto responder", error);
        await interaction.reply({ content: "Kay�t silinemedi.", ephemeral: true });
        return;
      }

      await interaction.reply({ content: "Otomatik yan�t silindi.", ephemeral: true });
    }
  }
};

export default command;
