import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

interface LogEntry {
  action: string;
  user_id: string | null;
  moderator_id: string | null;
  reason: string | null;
  created_at: string;
}

const fetchLogs = async () => {
  const { data, error } = await supabase
    .from("logs")
    .select("action, user_id, moderator_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as LogEntry[]) ?? [];
};

export const ModerationPage = () => {
  const [query, setQuery] = useState("");
  const { data: logs = [], refetch, isFetching } = useQuery({ queryKey: ["logs"], queryFn: fetchLogs });

  const filtered = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter((log) =>
      [log.action, log.user_id, log.moderator_id, log.reason]
        .filter(Boolean)
        .some((value) => (value ?? "").toLowerCase().includes(q))
    );
  }, [logs, query]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Moderasyon Araçları</CardTitle>
          <CardDescription>Sunucudaki son moderasyon hareketlerini incele</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Kullanıcı, yetkili veya aksiyon ara"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            />
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Yükleniyor..." : "Verileri Yenile"}
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Aksiyon</th>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Yetkili</th>
                  <th className="px-4 py-3">Sebep</th>
                  <th className="px-4 py-3">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40 text-slate-300">
                {filtered.map((log) => (
                  <tr key={`${log.created_at}-${log.user_id}-${log.action}`}>
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3">{log.user_id ? <span>@{log.user_id}</span> : "-"}</td>
                    <td className="px-4 py-3">{log.moderator_id ? <span>@{log.moderator_id}</span> : "-"}</td>
                    <td className="px-4 py-3">{log.reason ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
