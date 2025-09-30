import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../ui/utils";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Home, Shield, BotMessageSquare, Handshake, Trophy, Music, Bell, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Ana Sayfa", icon: Home },
  { to: "/moderation", label: "Moderasyon", icon: Shield },
  { to: "/automation", label: "Otomasyon", icon: BotMessageSquare },
  { to: "/welcome", label: "Karşılama", icon: Handshake },
  { to: "/xp", label: "XP & Level", icon: Trophy },
  { to: "/music", label: "Müzik", icon: Music },
  { to: "/notifications", label: "Bildirimler", icon: Bell },
  { to: "/settings", label: "Ayarlar", icon: Settings }
];

export const DashboardLayout = () => {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* decorative animated gradient blobs (mavi/yeşil) */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-tr from-sky-500/25 via-teal-500/20 to-emerald-400/20 blur-3xl animate-gradient" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-emerald-500/25 via-cyan-500/20 to-sky-500/25 blur-3xl animate-gradient" />
      {/* subtle grid overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-40" />

      <aside className="glass relative z-10 hidden w-72 border-r border-slate-800/60 p-6 lg:block">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">CyberHub</p>
            <h1 className="text-2xl font-semibold text-white">Yönetim Paneli</h1>
          </div>
          <ThemeToggle />
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-gradient-to-r from-sky-600/20 to-emerald-600/20 text-white shadow border border-sky-500/20"
                    : "text-slate-400 hover:bg-sky-500/10 hover:text-white"
                )
              }
            >
              {item.icon ? <item.icon size={16} className="text-sky-400" /> : null}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="relative z-10 flex flex-1 flex-col">
        <header className="glass flex items-center justify-between border-b border-slate-800/60 p-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">CyberHub</p>
            <h2 className="text-xl font-semibold text-white">Topluluk Durumu</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* basit global toggle görseli */}
            <div className="flex items-center gap-2 rounded-full bg-slate-800/60 px-2 py-1">
              <span className="text-xs text-slate-400">Genel</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition hover:bg-sky-700/60">
                <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white transition" />
              </button>
            </div>
            <ThemeToggle className="lg:hidden" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
