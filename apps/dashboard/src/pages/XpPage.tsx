import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabaseClient";

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  level: number;
}

const fetchLeaderboard = async () => {
  const { data, error } = await supabase
    .from("xp")
    .select("user_id, xp, level")
    .order("xp", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as LeaderboardEntry[];
};

export const XpPage = () => {
  const { data = [], refetch, isFetching } = useQuery({ queryKey: ["xp-leaderboard"], queryFn: fetchLeaderboard });

  const chartData = data.map((entry, index) => ({
    name: `#${index + 1}`,
    XP: entry.xp,
    Level: entry.level
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">XP & Level Sistemi</h2>
          <p className="text-sm text-slate-400">Supabase tabanlý liderlik tablosu ve aktivite özetleri</p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Yükleniyor..." : "Yenile"}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top 20 Liderlik Tablosu</CardTitle>
          <CardDescription>XP ve level bilgileri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">Sýra</th>
                  <th className="px-3 py-2">Kullanýcý</th>
                  <th className="px-3 py-2">Seviye</th>
                  <th className="px-3 py-2">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.map((entry, index) => (
                  <tr key={entry.user_id}>
                    <td className="px-3 py-2">#{index + 1}</td>
                    <td className="px-3 py-2">{entry.user_id}</td>
                    <td className="px-3 py-2">{entry.level}</td>
                    <td className="px-3 py-2">{entry.xp.toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
                {!data.length && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      Veri bulunamadý.
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
          <CardTitle>XP Daðýlýmý</CardTitle>
          <CardDescription>En aktif üyelerin XP ve level karþýlaþtýrmasý</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1f2937" }} />
              <Bar dataKey="XP" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
