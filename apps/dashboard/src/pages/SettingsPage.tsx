import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";
import { guildSettingsSchema, type GuildSettingsInput } from "@cyberhub/shared";
import type { ChangeEvent } from "react";

const fetchGuildMeta = async () => {
  const { data, error } = await supabase
    .from("guild_settings")
    .select("metadata")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.metadata ?? {}) as Partial<GuildSettingsInput>;
};

export const SettingsPage = () => {
  const { data, refetch } = useQuery({ queryKey: ["guild-metadata"], queryFn: fetchGuildMeta });
  const form = useForm<GuildSettingsInput>({
    resolver: zodResolver(guildSettingsSchema),
    defaultValues: {
      autoRoleIds: [],
      welcomeChannelId: null,
      goodbyeChannelId: null,
      logChannelId: null,
      announcementChannelId: null
    }
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      autoRoleIds: data.autoRoleIds ?? [],
      welcomeChannelId: data.welcomeChannelId ?? null,
      goodbyeChannelId: data.goodbyeChannelId ?? null,
      logChannelId: data.logChannelId ?? null,
      announcementChannelId: data.announcementChannelId ?? null
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.from("guild_settings").upsert({
      id: 1,
      guild_id: "primary",
      metadata: values
    });
    if (error) {
      console.error(error);
      return;
    }
    await refetch();
  });

  const handleAutoRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    form.setValue(
      "autoRoleIds",
      event.target.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  };

  const handleChannelChange = (field: keyof GuildSettingsInput) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      form.setValue(field, event.target.value || null);
    };

  const autoRoleValue = form.watch("autoRoleIds").join(",");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sunucu Ayarları</CardTitle>
        <CardDescription>Rol temelli yetkilendirme ve kanal ayarlarını yapılandır</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="settings-auto-roles">
              Otomatik Roller
            </label>
            <Input
              id="settings-auto-roles"
              value={autoRoleValue}
              onChange={handleAutoRoleChange}
              placeholder="rolID1, rolID2"
            />
            <p className="mt-1 text-xs text-slate-500">Kullanıcı katıldığında atanacak roller, virgül ile ayır.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300" htmlFor="settings-welcome-channel">
                Hoş geldin Kanal ID
              </label>
              <Input
                id="settings-welcome-channel"
                className="mt-1"
                value={form.watch("welcomeChannelId") ?? ""}
                onChange={handleChannelChange("welcomeChannelId")}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="settings-goodbye-channel">
                Ayrılma Kanal ID
              </label>
              <Input
                id="settings-goodbye-channel"
                className="mt-1"
                value={form.watch("goodbyeChannelId") ?? ""}
                onChange={handleChannelChange("goodbyeChannelId")}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="settings-log-channel">
                Log Kanal ID
              </label>
              <Input
                id="settings-log-channel"
                className="mt-1"
                value={form.watch("logChannelId") ?? ""}
                onChange={handleChannelChange("logChannelId")}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="settings-announcement-channel">
                Duyuru Kanal ID
              </label>
              <Input
                id="settings-announcement-channel"
                className="mt-1"
                value={form.watch("announcementChannelId") ?? ""}
                onChange={handleChannelChange("announcementChannelId")}
              />
            </div>
          </div>
          <Button type="submit">Kaydet</Button>
        </form>
      </CardContent>
    </Card>
  );
};
