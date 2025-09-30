import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

const streamSchema = z.object({
  platform: z.enum(["twitch", "youtube", "kick"]),
  channelName: z.string().min(2)
});

type StreamForm = z.infer<typeof streamSchema>;

const fetchStreams = async () => {
  const { data, error } = await supabase
    .from("streams")
    .select("id, platform, channel_name, is_live, last_notified")
    .order("platform", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

const fetchGithubEvents = async () => {
  const { data, error } = await supabase
    .from("github_events")
    .select("repo, event_type, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data ?? [];
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: fetchStreams });
  const { data: events = [] } = useQuery({ queryKey: ["github-events"], queryFn: fetchGithubEvents });

  const form = useForm<StreamForm>({ resolver: zodResolver(streamSchema) });

  const addStream = form.handleSubmit(async (values) => {
    const { error } = await supabase.from("streams").insert({
      platform: values.platform,
      channel_name: values.channelName,
      is_live: false,
      last_notified: null
    });
    if (error) {
      console.error(error);
      return;
    }
    form.reset();
    queryClient.invalidateQueries({ queryKey: ["streams"] });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Yayın Bildirimleri</CardTitle>
          <CardDescription>Twitch, YouTube ve Kick kanallarını takip et</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addStream} className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
            <label className="sr-only" htmlFor="stream-platform-select">
              Platform seçimi
            </label>
            <select
              id="stream-platform-select"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm"
              {...form.register("platform")}
              defaultValue="twitch"
            >
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="kick">Kick</option>
            </select>
            <Input id="stream-channel" placeholder="Kanal adı" {...form.register("channelName")} />
            <Button type="submit">Ekle</Button>
          </form>
          <div className="rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">Kanal</th>
                  <th className="px-3 py-2">Son Bildirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {streams.map((stream) => (
                  <tr key={stream.platform + '-' + stream.channel_name}>
                    <td className="px-3 py-2 uppercase">{stream.platform}</td>
                    <td className="px-3 py-2">{stream.channel_name}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {stream.last_notified
                        ? new Date(stream.last_notified).toLocaleString("tr-TR")
                        : "Henüz bildirim yok"}
                    </td>
                  </tr>
                ))}
                {!streams.length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                      Kayıtlı kanal bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Bildirimleri</CardTitle>
          <CardDescription>Son commit ve push etkinlikleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Repo</th>
                  <th className="px-3 py-2">Etkinlik</th>
                  <th className="px-3 py-2">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {events.map((event) => (
                  <tr key={event.repo + '-' + event.created_at}>
                    <td className="px-3 py-2">{event.repo}</td>
                    <td className="px-3 py-2 text-xs uppercase">{event.event_type}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {new Date(event.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
                {!events.length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                      Henüz GitHub etkinliği yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-4 text-xs text-indigo-100">
            <p className="font-semibold">GitHub webhook kurulumu</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>GitHub repo ayarlarında <em>Webhooks</em> sekmesine git.</li>
              <li>Supabase Edge Function URL bilgisini payload URL olarak ekle.</li>
              <li>Content type olarak <strong>application/json</strong> seç.</li>
              <li>Events kısmında <em>Push</em> ve <em>Pull request</em> bildirimlerini etkinleştir.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
