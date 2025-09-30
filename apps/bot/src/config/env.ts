import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { z } from "zod";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const candidateEnvFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(moduleDir, "..", ".env"),
  path.resolve(moduleDir, "../../.env")
];

for (const filePath of candidateEnvFiles) {
  if (fs.existsSync(filePath)) {
    loadEnv({ path: filePath, override: false });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID is required"),
  DISCORD_GUILD_ID: z.string().optional(),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  XP_COOLDOWN_SECONDS: z.string().optional(),
  XP_PER_MESSAGE: z.string().optional(),
  XP_PER_VOICE_MINUTE: z.string().optional(),
  AUTO_ROLE_IDS: z.string().optional(),
  WELCOME_CHANNEL_ID: z.string().optional(),
  GOODBYE_CHANNEL_ID: z.string().optional(),
  LOG_CHANNEL_ID: z.string().optional(),
  ANNOUNCEMENT_CHANNEL_ID: z.string().optional(),
  TWITCH_CLIENT_ID: z.string().optional(),
  TWITCH_CLIENT_SECRET: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("? Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const {
  NODE_ENV,
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  LOG_LEVEL,
  XP_COOLDOWN_SECONDS,
  XP_PER_MESSAGE,
  XP_PER_VOICE_MINUTE,
  AUTO_ROLE_IDS,
  WELCOME_CHANNEL_ID,
  GOODBYE_CHANNEL_ID,
  LOG_CHANNEL_ID,
  ANNOUNCEMENT_CHANNEL_ID,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET
} = parsed.data;

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const appConfig = {
  env: NODE_ENV,
  discord: {
    token: DISCORD_TOKEN,
    clientId: DISCORD_CLIENT_ID,
    guildId: DISCORD_GUILD_ID
  },
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY
  },
  logging: {
    level: LOG_LEVEL
  },
  xp: {
    cooldownSeconds: parseNumber(XP_COOLDOWN_SECONDS, 60),
    perMessage: parseNumber(XP_PER_MESSAGE, 15),
    perVoiceMinute: parseNumber(XP_PER_VOICE_MINUTE, 5)
  },
  guild: {
    autoRoleIds: AUTO_ROLE_IDS?.split(",")?.map((id) => id.trim()).filter(Boolean) ?? [],
    welcomeChannelId: WELCOME_CHANNEL_ID ?? null,
    goodbyeChannelId: GOODBYE_CHANNEL_ID ?? null,
    logChannelId: LOG_CHANNEL_ID ?? null,
    announcementChannelId: ANNOUNCEMENT_CHANNEL_ID ?? null
  },
  integrations: {
    twitch: {
      clientId: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_CLIENT_SECRET
    }
  }
} as const;

export type AppConfig = typeof appConfig;
