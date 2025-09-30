import type { Feature } from "../../core/feature";

const feature: Feature = {
  name: "autorole",
  description: "Yeni katýlan üyeleri otomatik olarak belirlenen rollere atar.",
  enabled: true,
  init(client) {
    client.on("guildMemberAdd", async (member) => {
      const roleIds = client.config.guild.autoRoleIds;
      if (!roleIds.length) return;

      const assignable = roleIds
        .map((id) => member.guild.roles.cache.get(id))
        .filter((role): role is NonNullable<typeof role> => Boolean(role));

      if (!assignable.length) return;

      try {
        await member.roles.add(assignable, "CyberHub auto role feature");
        client.logger.info(`Auto roles granted to ${member.user.tag}`);
      } catch (error) {
        client.logger.error(`Auto role assignment failed for ${member.id}`, error as Error);
      }
    });
  }
};

export default feature;
