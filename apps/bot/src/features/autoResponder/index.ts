import type { Feature } from "../../core/feature";

interface AutoResponse {
  trigger: string;
  response: string;
  match_type: "exact" | "contains" | "starts_with";
  is_embed?: boolean;
}

const feature: Feature = {
  name: "autoResponder",
  description: "Belirlenen tetikleyicilere otomatik yanit verir.",
  enabled: true,
  async init(client) {
    const { data, error } = await client.supabase
      .from("auto_responses")
      .select("trigger, response, match_type, is_embed");

    if (error) {
      client.logger.error("Failed to fetch auto responses", error);
      return;
    }

    const responders = (data as AutoResponse[]) ?? [];

    client.on("messageCreate", async (message) => {
      if (!message.inGuild() || message.author.bot) return;
      const content = message.content.toLowerCase();
      const match = responders.find((entry) => {
        const trigger = entry.trigger.toLowerCase();
        switch (entry.match_type) {
          case "exact":
            return content === trigger;
          case "starts_with":
            return content.startsWith(trigger);
          case "contains":
          default:
            return content.includes(trigger);
        }
      });

      if (!match) return;

      if (match.is_embed) {
        try {
          const embed = JSON.parse(match.response);
          await message.reply({ embeds: [embed] });
        } catch (error) {
          client.logger.error("Failed to parse auto response embed", error as Error);
        }
        return;
      }

      await message.reply(match.response);
    });
  }
};

export default feature;
