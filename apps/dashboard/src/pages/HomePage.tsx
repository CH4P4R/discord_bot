import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabaseClient";

interface ActivityMetric {
  captured_at: string;
  message_count: number;
  voice_minutes: number;
}

const fetchActivityMetrics = async () => {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data, error } = await supabase
    .from("activity_metrics")
    .select("captured_at, message_count, voice_minutes")
    .gte("captured_at", since.toISOString())
    .order("captured_at", { ascending: true });

  if (error) throw error;
  return data as ActivityMetric[];
};

const fetchRecentLogs = async () => {
  const { data, error } = await supabase
    .from("logs")
    .select("action, created_at, reason")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return data ?? [];
};

export const HomePage = () => {
  const { data: metrics = [] } = useQuery({ queryKey: ["activity"], queryFn: fetchActivityMetrics });
  const { data: logs = [] } = useQuery({ queryKey: ["recent-logs"], queryFn: fetchRecentLogs });

  const totals = metrics.reduce(
    (acc, metric) => {
      acc.messageCount += metric.message_count;
      acc.voiceMinutes += metric.voice_minutes;
      return acc;
    },
    { messageCount: 0, voiceMinutes: 0 }
  );

  const chartData = metrics.map((metric) => ({
    date: new Date(metric.captured_at).toLocaleDateString("tr-TR", { weekday: "short" }),
    Mesaj: metric.message_count,
    "Sesli (dk)": metric.voice_minutes
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Mesaj</CardTitle>
            <CardDescription>Son 7 gün</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-white">
            {totals.messageCount.toLocaleString("tr-TR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sesli Kanal Süresi</CardTitle>
            <CardDescription>Toplam dakika</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-white">
            {totals.voiceMinutes.toLocaleString("tr-TR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aktiflik Skoru</CardTitle>
            <CardDescription>Mesaj + ses aktivitesi</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-white">
            {(totals.messageCount + totals.voiceMinutes).toLocaleString("tr-TR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son Loglar</CardTitle>
            <CardDescription>Güncel moderasyon hareketi</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-300">
              {logs.map((log) => (
                <li key={`${log.action}-${log.created_at}`} className="flex items-center justify-between">
                  <span>{log.action}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
              {!logs.length && <li className="text-slate-500">Kayıt bulunamadı.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sunucu Aktivitesi</CardTitle>
          <CardDescription>Mesaj ve ses aktivitesi trendi</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1f2937" }} />
              <Line type="monotone" dataKey="Mesaj" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Sesli (dk)" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
