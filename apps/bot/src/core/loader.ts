import { pathToFileURL } from "node:url";
import path from "node:path";
import fg from "fast-glob";
import type { CyberClient } from "./cyberClient";
import type { SlashCommand } from "../typings/command";
import type { Feature } from "./feature";
import type { ClientEvents } from "discord.js";

export interface EventModule<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: CyberClient, ...args: ClientEvents[K]) => Promise<unknown> | unknown;
}

const toFileUrl = (filePath: string) => pathToFileURL(filePath).href;

const getBaseDir = () => {
  if (process.env.CYBERHUB_LOADER_ROOT) {
    return process.env.CYBERHUB_LOADER_ROOT;
  }

  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? "dist" : "src";
};

const buildGlob = (parts: string) => {
  const baseDir = getBaseDir();
  return path.posix.join(baseDir.replace(/\\/g, "/"), parts);
};

const resolveModuleFiles = async (pattern: string) =>
  fg(pattern, {
    cwd: process.cwd(),
    absolute: true,
    dot: false
  });

export const loadCommands = async (client: CyberClient) => {
  const files = await resolveModuleFiles(
    buildGlob("commands/**/*.{ts,js,mjs,cjs}")
  );

  client.commands.clear();

  await Promise.all(
    files.map(async (file) => {
      const imported = await import(toFileUrl(file));
      const command: SlashCommand | undefined = imported.default ?? imported.command;
      if (!command) return;
      if (!command.data || !command.execute) {
        client.logger.warn(`Command module at ${file} is missing data or execute definition.`);
        return;
      }
      client.commands.set(command.data.name, command);
    })
  );

  client.logger.info(`Loaded ${client.commands.size} commands.`);
};

export const loadEvents = async (client: CyberClient) => {
  const files = await resolveModuleFiles(
    buildGlob("events/**/*.{ts,js,mjs,cjs}")
  );

  client.removeAllListeners();

  await Promise.all(
    files.map(async (file) => {
      const imported = await import(toFileUrl(file));
      const event: EventModule | undefined = imported.default ?? imported.event;
      if (!event?.name || !event?.execute) {
        client.logger.warn(`Event module at ${file} is invalid.`);
        return;
      }

      if (event.once) {
        client.once(event.name, (...args) => void event.execute(client, ...(args as never)));
      } else {
        client.on(event.name, (...args) => void event.execute(client, ...(args as never)));
      }
    })
  );

  client.logger.info(`Loaded ${files.length} events.`);
};

export const loadFeatures = async (client: CyberClient) => {
  const files = await resolveModuleFiles(
    buildGlob("features/**/*/index.{ts,js,mjs,cjs}")
  );

  await Promise.all(
    files.map(async (file) => {
      const imported = await import(toFileUrl(file));
      const feature: Feature | undefined = imported.default ?? imported.feature;
      if (!feature) {
        client.logger.warn(`Feature module at ${file} is invalid.`);
        return;
      }

      if (feature.enabled === false) {
        client.logger.info(`Skipping disabled feature ${feature.name}.`);
        return;
      }

      try {
        await feature.init(client);
        client.features.set(feature.name, feature);
      } catch (error) {
        client.logger.error(`Error initialising feature ${feature.name}:`, error as Error);
      }
    })
  );

  client.logger.info(`Initialised ${client.features.size} features.`);
};
