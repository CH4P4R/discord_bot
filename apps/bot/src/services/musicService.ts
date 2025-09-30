import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  entersState,
  VoiceConnectionStatus,
  type VoiceConnection,
  type AudioPlayer,
  type AudioResource
} from "@discordjs/voice";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import play from "play-dl";
import yts from "yt-search";
import type { CyberClient } from "../core/cyberClient";

export interface Track {
  title: string;
  url: string;
  duration: string;
  requestedBy: string;
}

interface GuildQueue {
  connection: VoiceConnection;
  player: AudioPlayer;
  tracks: Track[];
  isPlaying: boolean;
}

interface MusicSettings {
  default_volume: number;
  dj_role_id: string | null;
}

export class MusicService {
  private readonly queues = new Map<string, GuildQueue>();
  private settings: MusicSettings | null = null;

  constructor(private readonly client: CyberClient) {}

  private async loadSettings(): Promise<MusicSettings> {
    if (this.settings) return this.settings;

    const { data, error } = await this.client.supabase
      .from("music_settings")
      .select("default_volume, dj_role_id")
      .limit(1)
      .maybeSingle();

    if (error) {
      this.client.logger.error("Failed to fetch music settings", error);
    }

    this.settings = {
      default_volume: data?.default_volume ?? 80,
      dj_role_id: data?.dj_role_id ?? null
    };

    return this.settings;
  }

  private async ensurePermissions(member: GuildMember) {
    const settings = await this.loadSettings();
    if (!settings.dj_role_id) return true;
    return member.roles.cache.has(settings.dj_role_id) || member.permissions.has("ManageGuild");
  }

  private async connect(interaction: ChatInputCommandInteraction): Promise<GuildQueue> {
    const member = interaction.member as GuildMember;
    const hasPerms = await this.ensurePermissions(member);
    if (!hasPerms) {
      throw new Error("Muzik kontrolu icin gerekli DJ rolune sahip degilsin");
    }

    const channel = member.voice.channel;
    if (!channel) throw new Error("Ses kanalinda degilsin");

    const existing = this.queues.get(interaction.guildId!);
    if (existing) return existing;

    const connection = joinVoiceChannel({
      guildId: interaction.guildId!,
      channelId: channel.id,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
      selfDeaf: false
    });

    connection.on("error", (error) => this.client.logger.error("Voice connection error", error));

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });

    player.on(AudioPlayerStatus.Idle, async () => {
      const queue = this.queues.get(interaction.guildId!);
      if (!queue) return;
      queue.tracks.shift();

      if (queue.tracks.length === 0) {
        queue.isPlaying = false;
        return;
      }

      const next = queue.tracks[0];
      const resource = await this.createResource(next);
      queue.player.play(resource);
    });

    player.on("error", (error) => this.client.logger.error("Audio player error", error));

    connection.subscribe(player);

    const queue: GuildQueue = {
      connection,
      player,
      tracks: [],
      isPlaying: false
    };

    this.queues.set(interaction.guildId!, queue);
    return queue;
  }

  private async createResource(track: Track): Promise<AudioResource> {
    try {
      const source = await play.stream(track.url, { discordPlayerCompatibility: true });
      const resource = createAudioResource(source.stream, { inputType: source.type, inlineVolume: true });
      const settings = await this.loadSettings();
      resource.volume?.setVolume(Math.min(Math.max(settings.default_volume, 0), 200) / 100);
      return resource;
    } catch (error) {
      this.client.logger.error("Failed to create audio resource", error as Error);
      throw error;
    }
  }

  async enqueue(interaction: ChatInputCommandInteraction, query: string) {
    const queue = await this.connect(interaction);
    const info = await this.findTrackMetadata(query);
    const track: Track = {
      title: info.title ?? "Bilinmeyen",
      url: info.url,
      duration: info.durationRaw ?? "0:00",
      requestedBy: interaction.user.tag
    };

    queue.tracks.push(track);

    if (!queue.isPlaying) {
      const resource = await this.createResource(track);
      queue.isPlaying = true;
      queue.player.play(resource);
    }

    return track;
  }

  private async findTrackMetadata(query: string) {
    try {
      const results = await play.search(query, { limit: 1, source: { youtube: "video" } });
      if (results?.length) {
        return results[0];
      }
    } catch (error) {
      this.client.logger.warn("play-dl search failed, falling back to yt-search", error as Error);
    }

    const fallback = await yts(query);
    const video = fallback?.videos?.[0];
    if (!video) {
      throw new Error("Sarki bulunamadi");
    }

    return {
      title: video.title,
      url: video.url,
      durationRaw: video.timestamp ?? "0:00"
    };
  }

  getQueue(guildId: string) {
    return this.queues.get(guildId);
  }

  async skip(interaction: ChatInputCommandInteraction) {
    const queue = this.queues.get(interaction.guildId!);
    if (!queue) throw new Error("Aktif sira yok");
    const member = interaction.member as GuildMember;
    const hasPerm = await this.ensurePermissions(member);
    if (!hasPerm) throw new Error("Bu komutu kullanmak icin DJ rolune ihtiyacin var");
    queue.player.stop(true);
  }

  async stop(interaction: ChatInputCommandInteraction) {
    const queue = this.queues.get(interaction.guildId!);
    if (!queue) return;
    const member = interaction.member as GuildMember;
    const hasPerm = await this.ensurePermissions(member);
    if (!hasPerm) throw new Error("Bu komutu kullanmak icin DJ rolune ihtiyacin var");
    queue.tracks = [];
    queue.isPlaying = false;
    queue.player.stop(true);
    queue.connection.destroy();
    this.queues.delete(interaction.guildId!);
  }
}

export const musicServiceFactory = (client: CyberClient) => new MusicService(client);
