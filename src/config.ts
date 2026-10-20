import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

/** Her modül bir veya birden fazla bota atanabilir. */
export const MODULES = ['core', 'moderation', 'guard', 'welcome', 'logs', 'level', 'economy', 'fun', 'tools', 'register', 'stats', 'jail', 'rooms', 'notify', 'spotify'] as const;

/**
 * Varsayılan modüller. 'spotify' hariç: Presence Intent (ayrıcalıklı) gerektirir,
 * Developer Portal'da açılmadan bota verilirse bot giriş yapamaz. İstersen modüllere elle ekle.
 */
export const DEFAULT_MODULES = MODULES.filter((m) => m !== 'spotify');

export interface BotDef {
  name: string;
  token: string;
  clientId: string;
  modules: string[];
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[HATA] .env dosyasında ${name} eksik. .env.example dosyasına bak.`);
    process.exit(1);
  }
  return v;
}

function loadBots(): BotDef[] {
  const file = path.join(process.cwd(), 'bots.json');
  if (!fs.existsSync(file)) {
    return [{ name: 'Nova', token: required('TOKEN'), clientId: required('CLIENT_ID'), modules: [...DEFAULT_MODULES] }];
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { bots?: Partial<BotDef>[] };
  const bots = (raw.bots ?? [])
    .filter((b) => b.token && b.clientId)
    .map((b, n) => ({ name: b.name ?? `Bot${n + 1}`, token: b.token!, clientId: b.clientId!, modules: b.modules?.length ? b.modules : [...DEFAULT_MODULES] }));
  if (!bots.length) {
    console.error('[HATA] bots.json içinde geçerli bot yok (her bot için token ve clientId gerekli).');
    process.exit(1);
  }
  for (const b of bots) {
    const unknown = b.modules.filter((m) => !(MODULES as readonly string[]).includes(m));
    if (unknown.length) console.warn(`[UYARI] ${b.name}: bilinmeyen modül(ler): ${unknown.join(', ')}`);
  }
  return bots;
}

const bots = loadBots();

export const config = {
  bots,
  /** Panel ve ana davet bağlantısı ilk botun uygulamasını kullanır. */
  clientId: bots[0].clientId,
  clientSecret: process.env.CLIENT_SECRET ?? '',
  guildId: process.env.GUILD_ID || null,
  twitchClientId: process.env.TWITCH_CLIENT_ID ?? '',
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET ?? '',
  port: Number(process.env.PORT ?? 3000),
  dashboardUrl: (process.env.DASHBOARD_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  sessionSecret: process.env.SESSION_SECRET ?? 'change-me',
  currency: '🪙',
};
