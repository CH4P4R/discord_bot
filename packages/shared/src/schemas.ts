import { z } from "zod";

export const supabaseConfigSchema = z.object({
  url: z.string().url(),
  anonKey: z.string(),
  serviceRoleKey: z.string().optional()
});

export const guildSettingsSchema = z.object({
  autoRoleIds: z.array(z.string()),
  welcomeChannelId: z.string().nullable(),
  goodbyeChannelId: z.string().nullable(),
  logChannelId: z.string().nullable(),
  announcementChannelId: z.string().nullable()
});

export const notificationSettingsSchema = z.object({
  twitchEnabled: z.boolean().default(false),
  youtubeEnabled: z.boolean().default(false),
  githubRepos: z.array(z.object({ repo: z.string(), channelId: z.string() })).default([])
});

export type SupabaseConfigInput = z.infer<typeof supabaseConfigSchema>;
export type GuildSettingsInput = z.infer<typeof guildSettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
