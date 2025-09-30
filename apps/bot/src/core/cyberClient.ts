import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  type Snowflake
} from "discord.js";
import { appConfig, type AppConfig } from "../config/env";
import { buildLogger, type Logger } from "../lib/logger";
import { createSupabaseClient, type DatabaseClient } from "../lib/supabase";
import type { SlashCommand } from "../typings/command";
import type { Feature } from "./feature";
import { loadCommands, loadEvents, loadFeatures } from "./loader";
import { musicServiceFactory, type MusicService } from "../services/musicService";
import { levelServiceFactory, type LevelService } from "../services/levelService";
import { logServiceFactory, type LogService } from "../services/logService";

export class CyberClient extends Client {
  public readonly config: AppConfig;
  public readonly logger: Logger;
  public readonly supabase: DatabaseClient;
  public readonly rest: REST;
  public readonly commands = new Collection<string, SlashCommand>();
  public readonly cooldowns = new Collection<string, Collection<Snowflake, number>>();
  public readonly features = new Map<string, Feature>();
  public readonly services: {
    music: MusicService;
    levels: LevelService;
    logs: LogService;
  };

  constructor(config: AppConfig = appConfig) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User]
    });

    this.config = config;
    this.logger = buildLogger(config);
    this.supabase = createSupabaseClient(config);
    this.rest = new REST({ version: "10" }).setToken(config.discord.token);
    this.services = {
      music: musicServiceFactory(this),
      levels: levelServiceFactory(this),
      logs: logServiceFactory(this)
    };
  }

  async init() {
    await loadCommands(this);
    await loadEvents(this);
    await loadFeatures(this);
    await this.registerSlashCommands();
  }

  async registerSlashCommands() {
    const commandPayload = this.commands.map((command) => command.data.toJSON());
    try {
      if (this.config.discord.guildId) {
        await this.rest.put(
          Routes.applicationGuildCommands(this.config.discord.clientId, this.config.discord.guildId),
          { body: commandPayload }
        );
        this.logger.info(`Registered ${commandPayload.length} guild slash commands.`);
      } else {
        await this.rest.put(Routes.applicationCommands(this.config.discord.clientId), { body: commandPayload });
        this.logger.info(`Registered ${commandPayload.length} global slash commands.`);
      }
    } catch (error) {
      this.logger.error("Failed to register slash commands", error as Error);
    }
  }

  async start() {
    await this.init();
    await this.login(this.config.discord.token);
  }

  public getCooldown(commandName: string, userId: Snowflake) {
    const commandCooldowns = this.cooldowns.ensure(commandName, () => new Collection<Snowflake, number>());
    const now = Date.now();
    return {
      remaining: Math.max((commandCooldowns.get(userId) ?? 0) - now, 0),
      set: (durationMs: number) => commandCooldowns.set(userId, now + durationMs)
    } as const;
  }
}

// Extend Collection with ensure helper
declare module "discord.js" {
  interface Collection<K, V> {
    ensure(key: K, defaultValue: () => V): V;
  }
}

Collection.prototype.ensure = function ensure(this: Collection<unknown, unknown>, key, defaultValue) {
  if (!this.has(key)) {
    const value = defaultValue();
    this.set(key, value);
    return value;
  }
  return this.get(key);
};

export const createCyberClient = () => new CyberClient();
