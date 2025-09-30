import type { EventModule } from "../core/loader";
import { Events } from "discord.js";

const event: EventModule<"interactionCreate"> = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      client.logger.warn("Received unknown command " + interaction.commandName);
      return;
    }

    if (command.guildOnly && !interaction.inGuild()) {
      await interaction.reply({ content: "Bu komut sadece sunucuda kullanilabilir.", ephemeral: true });
      return;
    }

    try {
      if (command.cooldown) {
        const { remaining, set } = client.getCooldown(command.data.name, interaction.user.id);
        if (remaining > 0) {
          const seconds = Math.ceil(remaining / 1000);
          await interaction.reply({
            content: "Bu komutu tekrar kullanmadan once " + seconds + " saniye beklemelisin.",
            ephemeral: true
          });
          return;
        }
        set(command.cooldown * 1000);
      }

      await command.execute({ client, interaction });
    } catch (error) {
      client.logger.error("Komut calistirilirken hata olustu: " + interaction.commandName, error as Error);
      if (interaction.isRepliable()) {
        const content = "Komut calistirilirken beklenmeyen bir hata olustu. Lutfen daha sonra tekrar dene.";
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  }
};

export default event;
