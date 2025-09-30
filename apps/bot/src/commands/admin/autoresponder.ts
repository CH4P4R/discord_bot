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
    .setDescription("Otomatik yanýt tetikleyicilerini yönetir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("ekle")
        .setDescription("Yeni otomatik yanýt ekler")
        .addStringOption((option) => option.setName("tetik").setDescription("Tetikleyici metin").setRequired(true))
        .addStringOption((option) =>
          option
            .setName("yanit")
            .setDescription("Yanýt metni veya embed JSON")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("eslesme")
            .setDescription("Eþleþme türü (exact | contains | starts_with)")
            .setChoices(
              { name: "Ayný (exact)", value: "exact" },
              { name: "Ýçeren (contains)", value: "contains" },
              { name: "Baþlayan (starts_with)", value: "starts_with" }
            )
        )
        .addBooleanOption((option) =>
          option.setName("embed").setDescription("Yanýt embed JSON olarak mý gönderilecek?")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("sil")
        .setDescription("Mevcut otomatik yanýtý sil")
        .addStringOption((option) => option.setName("tetik").setDescription("Tetikleyici").setRequired(true))
    ),
  async execute({ interaction, client }) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut yalnýzca sunucuda çalýþýr.", ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ekle") {
      const trigger = interaction.options.getString("tetik", true);
      const response = interaction.options.getString("yanit", true);
      const matchType = interaction.options.getString("eslesme") ?? "contains";
      const isEmbed = interaction.options.getBoolean("embed") ?? false;

      if (!isMatchType(matchType)) {
        await interaction.reply({ content: "Geçersiz eþleþme türü.", ephemeral: true });
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

      await interaction.reply({ content: "Otomatik yanýt eklendi.", ephemeral: true });
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
        await interaction.reply({ content: "Kayýt silinemedi.", ephemeral: true });
        return;
      }

      await interaction.reply({ content: "Otomatik yanýt silindi.", ephemeral: true });
    }
  }
};

export default command;
