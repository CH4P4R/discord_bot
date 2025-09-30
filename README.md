# CyberHub Discord Platform

CyberHub; siber guvenlik, yazilim ve teknoloji topluluklarini yonetmek icin olusturulmus, Discord.js v14 tabanli bot ile React + Tailwind destekli modern bir yonetim paneli iceren monorepo yapisidir. Moderasyon, otomasyon, istatistik, muzik, bildirim ve Supabase entegrasyonlari tek projede toplanir.

## Monorepo Yapisi

`
apps/
  bot/         # Discord botu (TypeScript, tsc derlemesi)
  dashboard/   # React + Vite yonetim paneli
packages/
  shared/      # Ortak tipler ve Zod semalari
`

## Ozellikler

- **Moderasyon**: /ban, /kick, /mute, /warn, /clear komutlari; Supabase log kaydi ve embed raporlama
- **Otomasyon**: Auto role, auto responder, kufur/link/spam filtresi, raid korumasi, reaction roles, starboard, gecici ses kanallari
- **XP & Level**: Mesaj ve ses aktivitesinden XP; level-up bildirimleri; liderlik tablolari
- **Istatistik**: Mesaj/ses snapshotlari Supabase'e yazilir; haftalik/aylik rapor cron gorevleri
- **Loglama**: Supabase + Discord embed log servisi
- **Muzik**: YouTube/Spotify aramasi, DJ rol kontrolu, fallback olarak yt-search
- **Bildirimler**: Streams tablosu uzerinden Twitch/YouTube/Kick bildirimi, GitHub etkinlik duyurulari
- **Dashboard**: Koyu temali, responsive panel; moderasyon loglari, otomasyon formlari, welcome embed builder, XP grafikleri, muzik ve bildirim ayarlari
- **Supabase Entegrasyonu**: users, xp, logs, activity_metrics, auto_responses, reaction_roles, surveys, streams, github_events, guild_settings (metadata), music_settings tablolarinin tam desteği

## Gerekli Teknolojiler

- Node.js >= 18 (repo .nvmrc / .node-version dosyalari ile 20.16.0 sabitlendi)
- npm workspaces
- Supabase projesi
- Discord uygulamasi (bot token + client id)

## Kurulum

`ash
npm install
npm run build --workspace @cyberhub/shared
npm run lint
npm run test
`

> Not: Husky kurulumu icin 
pm install sonrasi .husky scriptleri otomatik olusur; Windows ortaminda calismasi icin Git repo olmasi gerekir.

### Supabase Skemasi

Asagidaki SQL ornekleri temel tablolar icindir (ihtiyaciniza gore genisletebilirsiniz):

`
create table if not exists users (
  discord_id text primary key,
  username text not null,
  join_date timestamptz not null,
  avatar_url text
);

create table if not exists xp (
  id bigserial primary key,
  user_id text references users(discord_id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 0,
  last_message_at timestamptz,
  last_voice_at timestamptz
);

create table if not exists logs (
  id bigserial primary key,
  action text not null,
  user_id text,
  moderator_id text,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists activity_metrics (
  id bigserial primary key,
  guild_id text not null,
  message_count integer not null,
  voice_minutes integer not null,
  captured_at timestamptz not null
);

create table if not exists reaction_roles (
  id bigserial primary key,
  message_id text not null,
  emoji text not null,
  role_id text not null
);

create table if not exists auto_responses (
  id bigserial primary key,
  trigger text not null,
  response text not null,
  match_type text not null,
  is_embed boolean not null default false
);

create table if not exists streams (
  id bigserial primary key,
  platform text not null,
  channel_name text not null,
  is_live boolean not null default false,
  last_notified timestamptz
);

create table if not exists github_events (
  id bigserial primary key,
  repo text not null,
  event_type text not null,
  payload jsonb not null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists surveys (
  id bigserial primary key,
  question text not null,
  options text[] not null,
  votes jsonb not null default '{}',
  message_id text,
  channel_id text,
  created_at timestamptz not null default now()
);

create table if not exists guild_settings (
  id bigserial primary key,
  guild_id text unique not null,
  welcome_message text,
  goodbye_message text,
  rules_embed text,
  metadata jsonb
);

create table if not exists music_settings (
  id bigserial primary key,
  guild_id text unique not null,
  default_volume integer not null default 80,
  dj_role_id text,
  updated_at timestamptz not null default now()
);
`

### Supabase Service Role Notu

Haftalik/aylik rapor cronlari ve log/muzik ayarlari gibi islemler yazma yetkisi gerektirir. Bot icin .env dosyasinda SUPABASE_SERVICE_ROLE_KEY saglayin ve RLS politikalarinda bu servisin yapabilecegi islemleri acikca tanimlayin. Salt okuma gereken alanlar icin non key yeterlidir.

## Calistirma

### Bot

`ash
npm run dev:bot
# uretim icin
npm run build:bot
npm run start --workspace @cyberhub/bot
`

**Derleme Notu:** uild:bot komutu TypeScript kaynaklarini dist/ klasorune derler; loader, ortama gore (NODE_ENV=production) otomatik olarak dist altindaki modul dagilimini yukler.

### Dashboard

`ash
cd apps/dashboard
cp .env.example .env.local
npm run dev:dashboard
`

### Kod Kalitesi ve Test

- 
pm run lint tum workspacelerde ESLint calistirir.
- 
pm run format Prettier yazim kurallarini uygular.
- 
pm run test Vitest ile bot, dashboard ve shared paket testlerini kosar.
- 
pm run typecheck --workspace <paket> ile TypeScript kontrolu yapilabilir.

### Surekli Entegrasyon

.github/workflows/ci.yml isi, Node 18.x ve 20.x ortamlarinda 
pm run lint, 
pm run test, 
pm run build:bot, 
pm run build:dashboard adimlarini calistirir.

## Ogle Cikan Dosyalar

- pps/bot/src/core/cyberClient.ts: Komut/yetenek yukleyicisi ve servis bagimliliklari
- pps/bot/src/core/loader.ts: Ortama gore src veya dist altindan dinamik yukleme yapar
- pps/bot/src/services/*: Level, log, muzik, rapor servisleri
- pps/bot/src/features/*: Autorole, logging, levels, automod, notifications vb.
- pps/bot/vitest.config.ts: Bot icin test ortami ayari
- pps/dashboard/src/pages/*.tsx: Panel sayfalari
- pps/dashboard/vitest.config.ts: React test ayari
- packages/shared: Supabase tipleri, Zod semalari ve testleri

## Yol Haritasi

1. Streams tablosu icin gercek Twitch/YouTube API entegrasyonu ve webhook otomasyonu
2. Dashboard formlarina kayit duzenleme/silme islemleri
3. Vitest kapsamlarini genisletme ve Playwright ile e2e testler ekleme
4. Docker/Pm2 tabanli uretim calistirma senaryolari
5. Git hooks uzerinden otomatik typecheck/lint/format calistiracak gelistirmeler

Gelistirme sirasinda 
pm run build --workspace @cyberhub/shared komutu ile ortak paket derlemesini guncel tutmayi unutmayin.
