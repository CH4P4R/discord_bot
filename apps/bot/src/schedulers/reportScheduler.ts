import cron from "node-cron";
import { EmbedBuilder } from "discord.js";
import type { CyberClient } from "../core/cyberClient";
import { reportServiceFactory } from "../services/reportService";

export const startReportScheduler = (client: CyberClient) => {
  const reportService = reportServiceFactory(client);

  const sendReport = async (period: "weekly" | "monthly") => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const report = await reportService.generateActivityReport(guild.id, period);
    if (!report) return;

    const topMembers = await reportService.getTopMembers(5);

    const channelId = client.config.guild.announcementChannelId ?? client.config.guild.logChannelId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle(period === "weekly" ? "Haftalik Rapor" : "Aylik Rapor")
      .setColor(period === "weekly" ? 0x3498db : 0x9b59b6)
      .addFields(
        {
          name: "Mesaj Sayisi",
          value: report.messageCount.toLocaleString("tr-TR"),
          inline: true
        },
        {
          name: "Ses Kanali Suresi",
          value: `${report.voiceMinutes} dakika`,
          inline: true
        },
        {
          name: "Rapor Tarihi",
          value: `<t:${Math.floor(new Date(report.generatedAt).getTime() / 1000)}:F>`
        }
      )
      .setTimestamp(new Date());

    if (topMembers.length) {
      embed.addFields({
        name: "En Aktif Uyeler",
        value: topMembers
          .map((entry, index) => `${index + 1}. <@${entry.userId}> - Seviye ${entry.level} - ${entry.xp} XP`)
          .join("\n")
      });
    }

    await channel.send({ embeds: [embed] }).catch((error) => client.logger.error("Failed to send report", error));
  };

  const weeklyJob = cron.schedule("0 10 * * MON", () => void sendReport("weekly"), { timezone: "Europe/Istanbul" });
  const monthlyJob = cron.schedule("0 11 1 * *", () => void sendReport("monthly"), { timezone: "Europe/Istanbul" });

  weeklyJob.start();
  monthlyJob.start();

  client.logger.info("Report scheduler started.");
};
