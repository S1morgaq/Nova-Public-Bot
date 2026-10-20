import fs from 'node:fs';
import path from 'node:path';

export interface AutoMod {
  invites: boolean;
  links: boolean;
  caps: boolean;
  spam: boolean;
  badWords: string[];
}

export interface AntiRaid {
  enabled: boolean;
  joins: number;
  seconds: number;
  minAccountDays: number;
}

export interface Reminder {
  id: number;
  userId: string;
  channelId: string;
  text: string;
  at: number;
}

export interface GuardSettings {
  enabled: boolean;
  punishment: 'ban' | 'kick' | 'strip';
  /** Dakikada izin verilen ban/kick sayısı (beyaz listede olmayanlar için). */
  limit: number;
  whitelist: string[];
}

export interface Jail {
  guildId: string;
  userId: string;
  roles: string[];
  until: number | null;
  reason: string;
}

export interface Backup {
  at: number;
  roles: { name: string; color: number; hoist: boolean; mentionable: boolean; permissions: string }[];
  channels: {
    name: string;
    type: number;
    parent: string | null;
    topic: string | null;
    nsfw: boolean;
    userLimit: number;
    bitrate: number;
    position: number;
    overwrites: { role: string; type: number; allow: string; deny: string }[];
  }[];
}

export interface Streamer {
  id: number;
  guildId: string;
  platform: 'youtube' | 'twitch';
  /** YouTube kanal ID'si (UC...) veya Twitch kullanıcı adı */
  target: string;
  channelId: string;
  message: string;
  /** Son bildirilen video/yayın ID'si */
  last: string | null;
}

export type LogType = 'message' | 'voice' | 'member' | 'mod' | 'guard';

export interface ShopItem {
  id: number;
  name: string;
  price: number;
  /** Doluysa satın alınca bu rol verilir; boşsa envantere eklenir. */
  roleId?: string;
}

export interface GuildSettings {
  shop: ShopItem[];
  /** Tetikleyici kelime → otomatik yanıt */
  autoResponses: Record<string, string>;
  /** Türe göre ayrı log kanalları. Tanımsızsa logChannel kullanılır. */
  logs: Partial<Record<LogType, string>>;
  levelRoles: Record<string, string>;
  guard: GuardSettings;
  jailRole: string | null;
  jailStaffRole: string | null;
  roomHub: string | null;
  counterChannel: string | null;
  registerStaffRole: string | null;
  registerMemberRole: string | null;
  registerUnregRole: string | null;
  prefix: string;
  starChannel: string | null;
  starThreshold: number;
  antiRaid: AntiRaid;
  customCommands: Record<string, string>;
  logChannel: string | null;
  welcomeChannel: string | null;
  welcomeMessage: string;
  goodbyeChannel: string | null;
  autoRole: string | null;
  levelEnabled: boolean;
  ticketStaffRole: string | null;
  ticketCategory: string | null;
  automod: AutoMod;
}

export interface UserData {
  xp: number;
  level: number;
  messages: number;
  balance: number;
  lastDaily: number;
  lastWork: number;
  lastXp: number;
  afk?: { reason: string; since: number } | null;
  voiceSeconds?: number;
  registered?: number;
  bank?: number;
  inventory?: Record<string, number>;
  invites?: number;
  invitesLeft?: number;
  invitedBy?: string;
  rep?: number;
  lastRep?: number;
  bio?: string;
  cooldowns?: Record<string, number>;
}

export interface WarnEntry {
  id: number;
  guildId: string;
  userId: string;
  modId: string;
  reason: string;
  at: number;
}

export interface Giveaway {
  messageId: string;
  guildId: string;
  channelId: string;
  hostId: string;
  prize: string;
  winners: number;
  endsAt: number;
  participants: string[];
  ended: boolean;
}

interface Store {
  guilds: Record<string, Partial<GuildSettings>>;
  users: Record<string, UserData>;
  warns: WarnEntry[];
  giveaways: Giveaway[];
  warnCounter: number;
  reminders: Reminder[];
  reminderCounter: number;
  stars: Record<string, string>;
  jails: Jail[];
  rooms: Record<string, string>;
  backups: Record<string, Backup>;
  streamers: Streamer[];
  streamerCounter: number;
}

const DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'db.json');

function load(): Store {
  const empty: Store = { guilds: {}, users: {}, warns: [], giveaways: [], warnCounter: 0, reminders: [], reminderCounter: 0, stars: {}, jails: [], rooms: {}, backups: {}, streamers: [], streamerCounter: 0 };
  try {
    return { ...empty, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch {
    return empty;
  }
}

const store = load();
let timer: NodeJS.Timeout | null = null;

function flush(): void {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE + '.tmp', JSON.stringify(store));
    fs.renameSync(FILE + '.tmp', FILE);
  } catch (e) {
    console.error('[DB] Kaydedilemedi:', e);
  }
}

function save(): void {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, 1000);
}

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    flush();
    process.exit(0);
  });
}

const defaultGuild = (): GuildSettings => ({
  shop: [],
  autoResponses: {},
  logs: {},
  levelRoles: {},
  guard: { enabled: false, punishment: 'ban', limit: 3, whitelist: [] },
  jailRole: null,
  jailStaffRole: null,
  roomHub: null,
  counterChannel: null,
  registerStaffRole: null,
  registerMemberRole: null,
  registerUnregRole: null,
  prefix: '.',
  starChannel: null,
  starThreshold: 3,
  antiRaid: { enabled: false, joins: 5, seconds: 10, minAccountDays: 0 },
  customCommands: {},
  logChannel: null,
  welcomeChannel: null,
  welcomeMessage: 'Hoş geldin {user}! **{server}** sunucusunda {count}. üyeyiz 🎉',
  goodbyeChannel: null,
  autoRole: null,
  levelEnabled: true,
  ticketStaffRole: null,
  ticketCategory: null,
  automod: { invites: false, links: false, caps: false, spam: false, badWords: [] },
});

export function getGuild(id: string): GuildSettings {
  const d = defaultGuild();
  const s = store.guilds[id] ?? {};
  return { ...d, ...s, automod: { ...d.automod, ...s.automod }, antiRaid: { ...d.antiRaid, ...s.antiRaid }, guard: { ...d.guard, ...s.guard }, logs: { ...d.logs, ...s.logs } };
}

export function updateGuild(id: string, patch: Partial<GuildSettings>): GuildSettings {
  store.guilds[id] = { ...store.guilds[id], ...patch };
  save();
  return getGuild(id);
}

export function getUser(guildId: string, userId: string): UserData {
  const key = `${guildId}:${userId}`;
  store.users[key] ??= { xp: 0, level: 0, messages: 0, balance: 0, lastDaily: 0, lastWork: 0, lastXp: 0 };
  return store.users[key];
}

export const touch = save;

export function resetUser(guildId: string, userId: string): void {
  delete store.users[`${guildId}:${userId}`];
  save();
}

export const guildUserIds = (guildId: string): string[] =>
  Object.keys(store.users)
    .filter((k) => k.startsWith(guildId + ':'))
    .map((k) => k.split(':')[1]);

export type RankBy = 'level' | 'balance' | 'voice' | 'messages' | 'invites' | 'rep';

export function topUsers(guildId: string, limit = 10, by: RankBy = 'level') {
  const sorters: Record<RankBy, (a: UserData, b: UserData) => number> = {
    level: (a, b) => b.level - a.level || b.xp - a.xp,
    balance: (a, b) => b.balance - a.balance,
    voice: (a, b) => (b.voiceSeconds ?? 0) - (a.voiceSeconds ?? 0),
    messages: (a, b) => b.messages - a.messages,
    invites: (a, b) => (b.invites ?? 0) - (b.invitesLeft ?? 0) - ((a.invites ?? 0) - (a.invitesLeft ?? 0)),
    rep: (a, b) => (b.rep ?? 0) - (a.rep ?? 0),
  };
  return Object.entries(store.users)
    .filter(([k]) => k.startsWith(guildId + ':'))
    .map(([k, v]) => ({ userId: k.split(':')[1], ...v }))
    .sort(sorters[by])
    .slice(0, limit);
}

export function addWarn(w: Omit<WarnEntry, 'id' | 'at'>): WarnEntry {
  const entry = { ...w, id: ++store.warnCounter, at: Date.now() };
  store.warns.push(entry);
  save();
  return entry;
}

export const getWarns = (guildId: string, userId: string) =>
  store.warns.filter((w) => w.guildId === guildId && w.userId === userId);

export function removeWarn(guildId: string, id: number): boolean {
  const before = store.warns.length;
  store.warns = store.warns.filter((w) => !(w.guildId === guildId && w.id === id));
  save();
  return before !== store.warns.length;
}

export function clearWarns(guildId: string, userId: string): number {
  const before = store.warns.length;
  store.warns = store.warns.filter((w) => !(w.guildId === guildId && w.userId === userId));
  save();
  return before - store.warns.length;
}

export const giveaways = {
  all: () => store.giveaways,
  add(g: Giveaway) {
    store.giveaways.push(g);
    save();
  },
  get: (messageId: string) => store.giveaways.find((g) => g.messageId === messageId),
  save,
};

export const reminders = {
  all: () => store.reminders,
  add(r: Omit<Reminder, 'id'>) {
    const entry = { ...r, id: ++store.reminderCounter };
    store.reminders.push(entry);
    save();
    return entry;
  },
  remove(id: number) {
    store.reminders = store.reminders.filter((r) => r.id !== id);
    save();
  },
};

export const stars = {
  get: (messageId: string) => store.stars[messageId],
  set(messageId: string, starMessageId: string) {
    store.stars[messageId] = starMessageId;
    save();
  },
};

export const jails = {
  all: () => store.jails,
  get: (guildId: string, userId: string) => store.jails.find((j) => j.guildId === guildId && j.userId === userId),
  add(j: Jail) {
    store.jails = store.jails.filter((x) => !(x.guildId === j.guildId && x.userId === j.userId));
    store.jails.push(j);
    save();
  },
  remove(guildId: string, userId: string) {
    store.jails = store.jails.filter((x) => !(x.guildId === guildId && x.userId === userId));
    save();
  },
};

export const rooms = {
  get: (channelId: string) => store.rooms[channelId],
  set(channelId: string, ownerId: string) {
    store.rooms[channelId] = ownerId;
    save();
  },
  delete(channelId: string) {
    delete store.rooms[channelId];
    save();
  },
};

export const streamers = {
  all: () => store.streamers,
  add(s: Omit<Streamer, 'id' | 'last'>) {
    const entry: Streamer = { ...s, id: ++store.streamerCounter, last: null };
    store.streamers.push(entry);
    save();
    return entry;
  },
  remove(guildId: string, id: number) {
    const before = store.streamers.length;
    store.streamers = store.streamers.filter((s) => !(s.guildId === guildId && s.id === id));
    save();
    return before !== store.streamers.length;
  },
  save,
};

export const backups = {
  get: (guildId: string) => store.backups[guildId],
  set(guildId: string, b: Backup) {
    store.backups[guildId] = b;
    save();
  },
};

export const stats = () => ({
  guilds: Object.keys(store.guilds).length,
  users: Object.keys(store.users).length,
});
