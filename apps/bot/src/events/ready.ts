import type { EventModule } from "../core/loader";
import { ActivityType } from "discord.js";
import { startSchedulers } from "../schedulers";

const event: EventModule<"ready"> = {
  name: "ready",
  once: true,
  async execute(client) {
    client.logger.info(`Logged in as ${client.user?.tag ?? "unknown user"}`);
    client.user?.setPresence({
      activities: [
        {
          name: "Cyber security & dev ops",
          type: ActivityType.Watching
        }
      ],
      status: "online"
    });

    startSchedulers(client);
    client.logger.info("Bot initialisation complete.");
  }
};

export default event;
