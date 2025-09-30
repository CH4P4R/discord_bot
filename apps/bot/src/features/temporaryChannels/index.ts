import { ChannelType } from "discord.js";
import type { Feature } from "../../core/feature";

const TRIGGER_KEYWORDS = ["ozel oda", "create vc", "temporary"];

const feature: Feature = {
  name: "temporaryChannels",
  description: "Kullanicilarin kisa sureli ozel ses kanallari olusturmasini saglar.",
  enabled: true,
  init(client) {
    const activeChannels = new Set<string>();

    client.on("voiceStateUpdate", async (oldState, newState) => {
      const newChannel = newState.channel;
      const member = newState.member ?? oldState.member;
      if (!member || member.user.bot) return;

      if (newChannel && TRIGGER_KEYWORDS.some((keyword) => newChannel.name.toLowerCase().includes(keyword))) {
        const guild = newChannel.guild;
        try {
          const channel = await guild.channels.create({
            name: `${member.displayName} | Gecici Oda`,
            type: ChannelType.GuildVoice,
            parent: newChannel.parentId ?? undefined,
            permissionOverwrites: [
              {
                id: member.id,
                allow: ["Connect", "Speak", "ManageChannels"]
              }
            ]
          });

          activeChannels.add(channel.id);

          await member.voice.setChannel(channel);
        } catch (error) {
          client.logger.error("Temporary channel creation failed", error as Error);
        }
      }

      const oldChannel = oldState.channel;
      if (oldChannel && activeChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete("Temporary channel cleanup");
          activeChannels.delete(oldChannel.id);
        } catch (error) {
          client.logger.error("Temporary channel cleanup failed", error as Error);
        }
      }
    });
  }
};

export default feature;
