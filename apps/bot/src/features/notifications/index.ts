import cron from "node-cron";
import type { TextChannel } from "discord.js";
import type { Feature } from "../../core/feature";

interface StreamConfig {
  id?: number;
  platform: string;
  channel_name: string;
  is_live: boolean;
  last_notified: string | null;
}

interface GithubEventRecord {
  id: number;
  repo: string;
  event_type: string;
  payload: Record<string, unknown>;
  notified: boolean;
  created_at: string;
}

const STREAM_CRON = "*/5 * * * *";
const GITHUB_CRON = "*/2 * * * *";

const feature: Feature = {
  name: "notifications",
  description: "Twitch/YouTube yayinlarini ve GitHub etkinliklerini takip eder.",
  enabled: true,
  init(client) {
    const announcementId = client.config.guild.announcementChannelId;
    if (!announcementId) {
      client.logger.warn("Bildirimler icin duyuru kanali tanimli degil.");
      return;
    }

    const channelResolver = () => {
      const guild = client.guilds.cache.first();
      const channel = guild?.channels.cache.get(announcementId);
      return channel?.isTextBased() ? (channel as TextChannel) : null;
    };

    const streamJob = cron.schedule(
      STREAM_CRON,
      async () => {
        const channel = channelResolver();
        if (!channel) return;

        const { data, error } = await client.supabase
          .from("streams")
          .select("id, platform, channel_name, is_live, last_notified");

        if (error) {
          client.logger.error("Failed to fetch stream configs", error);
          return;
        }

        const streams = (data as StreamConfig[]) ?? [];

        for (const stream of streams) {
          if (stream.is_live && !stream.last_notified) {
            await channel.send(
              `[CANLI] ${stream.platform.toUpperCase()} uzerinde ${stream.channel_name} yayinda!`
            );
            await client.supabase
              .from("streams")
              .update({ last_notified: new Date().toISOString() })
              .eq("id", stream.id ?? 0);
          }
        }
      },
      { timezone: "Europe/Istanbul" }
    );

    const githubJob = cron.schedule(
      GITHUB_CRON,
      async () => {
        const channel = channelResolver();
        if (!channel) return;

        const { data, error } = await client.supabase
          .from("github_events")
          .select("id, repo, event_type, payload, notified")
          .eq("notified", false)
          .order("created_at", { ascending: true })
          .limit(10);

        if (error) {
          client.logger.error("Failed to fetch GitHub events", error);
          return;
        }

        const events = (data as GithubEventRecord[]) ?? [];

        for (const event of events) {
          const payload = event.payload ?? {};
          const author = (payload as { sender?: { login?: string } }).sender?.login ?? "Bilinmeyen";
          await channel.send(
            `[GITHUB] ${event.repo} deposunda yeni ${event.event_type} etkinligi: ${author}`
          );
          await client.supabase
            .from("github_events")
            .update({ notified: true })
            .eq("id", event.id);
        }
      },
      { timezone: "Europe/Istanbul" }
    );

    streamJob.start();
    githubJob.start();

    client.logger.info("Notification jobs scheduled.");
  }
};

export default feature;
