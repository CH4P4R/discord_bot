import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import type { CyberClient } from "../core/cyberClient";

export type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface SlashCommand {
  name: string;
  category: string;
  cooldown?: number; // seconds
  guildOnly?: boolean;
  defaultMemberPermissions?: bigint;
  data: SlashCommandData;
  execute: (ctx: CommandExecuteContext) => Promise<void>;
}

export interface CommandExecuteContext {
  interaction: ChatInputCommandInteraction;
  client: CyberClient;
}
