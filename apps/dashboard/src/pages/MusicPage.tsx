import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

const schema = z.object({
  defaultVolume: z.coerce.number().min(0).max(200),
  djRoleId: z.string().optional()
});

type MusicForm = z.infer<typeof schema>;

const fetchMusicSettings = async () => {
  const { data, error } = await supabase
    .from("music_settings")
    .select("default_volume, dj_role_id")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const MusicPage = () => {
  const { data, refetch } = useQuery({ queryKey: ["music-settings"], queryFn: fetchMusicSettings });
  const form = useForm<MusicForm>({
    resolver: zodResolver(schema),
    defaultValues: { defaultVolume: 80, djRoleId: "" }
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      defaultVolume: data.default_volume ?? 80,
      djRoleId: data.dj_role_id ?? ""
    });
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.from("music_settings").upsert({
      id: 1,
      guild_id: "primary",
      default_volume: values.defaultVolume,
      dj_role_id: values.djRoleId || null,
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.error(error);
      return;
    }
    await refetch();
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Müzik Kontrol Ayarları</CardTitle>
          <CardDescription>Botun varsayılan müzik davranışını yapılandır</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="music-default-volume">
                Varsayılan Ses
              </label>
              <Input
                id="music-default-volume"
                type="number"
                min={0}
                max={200}
                {...form.register("defaultVolume", { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-slate-500">Slash komutlarıyla şarkı çalındığında kullanılacak başlangıç ses seviyesi</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="music-dj-role">
                DJ Rol ID
              </label>
              <Input id="music-dj-role" placeholder="Rol ID (isteğe bağlı)" {...form.register("djRoleId")} />
              <p className="mt-1 text-xs text-slate-500">Bu rol slash komutlarıyla müzik kontrolü yapabilir.</p>
            </div>
            <Button type="submit">Kaydet</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Komutlar</CardTitle>
          <CardDescription>Müzik sistemi hızlı komut listesi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p><span className="text-indigo-400">/play</span> - YouTube veya Spotify URL/araması ile şarkı ekler.</p>
          <p><span className="text-indigo-400">/skip</span> - Sonraki şarkıya geçer.</p>
          <p><span className="text-indigo-400">/queue</span> - Sıradaki şarkıları gösterir.</p>
          <p><span className="text-indigo-400">/stop</span> - Sırayı temizler ve bağlantıyı kapatır.</p>
          <p className="text-xs text-slate-500">Spotify çalma listeleri için botun `SPOTIFY_CLIENT_ID/SECRET` doğrulaması gerekir.</p>
        </CardContent>
      </Card>
    </div>
  );
};
