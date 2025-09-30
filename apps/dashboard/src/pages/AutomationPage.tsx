import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";
import { useMemo, useState } from "react";

const reactionRoleSchema = z.object({
  messageId: z.string().min(1),
  emoji: z.string().min(1),
  roleId: z.string().min(1)
});

type ReactionRoleForm = z.infer<typeof reactionRoleSchema>;

const autoResponseSchema = z.object({
  trigger: z.string().min(1),
  response: z.string().min(1),
  matchType: z.enum(["exact", "contains", "starts_with"]),
  isEmbed: z.boolean().optional()
});

type AutoResponseForm = z.infer<typeof autoResponseSchema>;

const fetchReactionRoles = async () => {
  const { data, error } = await supabase.from("reaction_roles").select("message_id, emoji, role_id");
  if (error) throw error;
  return data ?? [];
};

const fetchAutoResponses = async () => {
  const { data, error } = await supabase
    .from("auto_responses")
    .select("trigger, response, match_type, is_embed");
  if (error) throw error;
  return data ?? [];
};

export const AutomationPage = () => {
  // ——— Referanstaki Otomatik Moderasyon grid’ini yansıtan görsel durum ———
  const [automodEnabled, setAutomodEnabled] = useState(true);
  const [modules, setModules] = useState([
    { key: "spam", title: "SPAM (5 mesaj/5sn)", enabled: false, premium: false },
    { key: "bad_words", title: "Uygunsuz Kelimeler", enabled: false, premium: false },
    { key: "duplicate", title: "Çoğaltılmış Metin", enabled: false, premium: false },
    { key: "invites", title: "Discord Davetleri", enabled: false, premium: false },
    { key: "links", title: "Bağlantılar", enabled: false, premium: false },
    { key: "caps", title: "Spamlanmış CAPSler (%70+ CAPSler)", enabled: false, premium: false },
    { key: "emoji", title: "Emoji Spamlama", enabled: false, premium: false },
    { key: "mass_mention", title: "Toplu Bahsetme", enabled: false, premium: false }
  ]);
  const [excludedChannels, setExcludedChannels] = useState<string[]>([]);
  const [excludedRoles, setExcludedRoles] = useState<string[]>([]);
  const [imagesOnlyChannels, setImagesOnlyChannels] = useState<string[]>([]);
  const [youtubeOnlyChannels, setYoutubeOnlyChannels] = useState<string[]>([]);

  const addChip = (list: string[], setList: (v: string[]) => void) => (value: string) => {
    const v = value.trim();
    if (!v) return;
    setList(Array.from(new Set([...list, v])));
  };

  const removeChip = (list: string[], setList: (v: string[]) => void, value: string) => () => {
    setList(list.filter((x) => x !== value));
  };

  const Chip = ({ label, onRemove }: { label: string; onRemove?: () => void }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-sky-600/30 bg-sky-600/10 px-2.5 py-1 text-xs text-sky-200">
      {label}
      {onRemove ? (
        <button onClick={onRemove} className="rounded-full bg-slate-800/60 px-1.5 text-slate-300 hover:bg-sky-700/60">
          ×
        </button>
      ) : null}
    </span>
  );
  const queryClient = useQueryClient();
  const { data: reactionRoles = [] } = useQuery({ queryKey: ["reaction-roles"], queryFn: fetchReactionRoles });
  const { data: autoResponses = [] } = useQuery({ queryKey: ["auto-responses"], queryFn: fetchAutoResponses });

  const reactionRoleForm = useForm<ReactionRoleForm>({
    resolver: zodResolver(reactionRoleSchema)
  });

  const autoResponseForm = useForm<AutoResponseForm>({
    resolver: zodResolver(autoResponseSchema),
    defaultValues: { matchType: "contains", isEmbed: false }
  });

  const addReactionRole = reactionRoleForm.handleSubmit(async (values) => {
    const { error } = await supabase.from("reaction_roles").insert({
      message_id: values.messageId,
      emoji: values.emoji,
      role_id: values.roleId
    });
    if (error) {
      console.error(error);
      return;
    }
    reactionRoleForm.reset();
    queryClient.invalidateQueries({ queryKey: ["reaction-roles"] });
  });

  const addAutoResponse = autoResponseForm.handleSubmit(async (values) => {
    const { error } = await supabase.from("auto_responses").insert({
      trigger: values.trigger,
      response: values.response,
      match_type: values.matchType,
      is_embed: values.isEmbed ?? false
    });
    if (error) {
      console.error(error);
      return;
    }
    autoResponseForm.reset({ matchType: "contains", isEmbed: false });
    queryClient.invalidateQueries({ queryKey: ["auto-responses"] });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Otomatik Moderasyon</CardTitle>
            <CardDescription>Kuralları aç/kapat; kanal ve rol istisnaları ayarla</CardDescription>
          </div>
          <button
            onClick={() => setAutomodEnabled((v) => !v)}
            className={
              "relative inline-flex h-7 w-14 items-center rounded-full transition " +
              (automodEnabled ? "bg-emerald-600/80" : "bg-slate-700")
            }
          >
            <span
              className={
                "inline-block h-6 w-6 transform rounded-full bg-white transition " +
                (automodEnabled ? "translate-x-7" : "translate-x-1")
              }
            />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((m, idx) => (
              <div key={m.key} className="glass rounded-lg border border-slate-800/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-slate-100">{m.title}</p>
                  <button
                    onClick={() =>
                      setModules((prev) => prev.map((x, i) => (i === idx ? { ...x, enabled: !x.enabled } : x)))
                    }
                    className={
                      "relative inline-flex h-6 w-12 items-center rounded-full transition " +
                      (m.enabled ? "bg-sky-600/80" : "bg-slate-700")
                    }
                  >
                    <span
                      className={
                        "inline-block h-5 w-5 transform rounded-full bg-white transition " +
                        (m.enabled ? "translate-x-6" : "translate-x-1")
                      }
                    />
                  </button>
                </div>
                <button className="w-full rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 hover:border-sky-600/40">
                  Kuralı Düzenle
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-slate-400">Devre Dışı Kanallar</p>
              <div className="flex flex-wrap gap-2">
                {excludedChannels.map((c) => (
                  <Chip key={c} label={c} onRemove={removeChip(excludedChannels, setExcludedChannels, c)} />
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="#kanal-adi" onKeyDown={(e) => e.key === "Enter" && addChip(excludedChannels, setExcludedChannels)((e.target as HTMLInputElement).value)} />
                <Button type="button" onClick={() => {}}>
                  Ekle
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-slate-400">Devre Dışı Roller</p>
                <div className="flex flex-wrap gap-2">
                  {excludedRoles.map((r) => (
                    <Chip key={r} label={r} onRemove={removeChip(excludedRoles, setExcludedRoles, r)} />
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="@rol" onKeyDown={(e) => e.key === "Enter" && addChip(excludedRoles, setExcludedRoles)((e.target as HTMLInputElement).value)} />
                  <Button type="button" onClick={() => {}}>
                    Ekle
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-slate-400">Sadece Resim Kanalları</p>
                <div className="flex flex-wrap gap-2">
                  {imagesOnlyChannels.map((c) => (
                    <Chip key={c} label={c} onRemove={removeChip(imagesOnlyChannels, setImagesOnlyChannels, c)} />
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="#kanal-adi" onKeyDown={(e) => e.key === "Enter" && addChip(imagesOnlyChannels, setImagesOnlyChannels)((e.target as HTMLInputElement).value)} />
                  <Button type="button" onClick={() => {}}>
                    Ekle
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-400">Sadece YouTube Bağlantısı Kanalları</p>
              <div className="flex flex-wrap gap-2">
                {youtubeOnlyChannels.map((c) => (
                  <Chip key={c} label={c} onRemove={removeChip(youtubeOnlyChannels, setYoutubeOnlyChannels, c)} />
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="#kanal-adi" onKeyDown={(e) => e.key === "Enter" && addChip(youtubeOnlyChannels, setYoutubeOnlyChannels)((e.target as HTMLInputElement).value)} />
                <Button type="button" onClick={() => {}}>
                  Ekle
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
