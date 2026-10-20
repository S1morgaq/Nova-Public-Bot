import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config, type BotDef } from './config';
import { startDashboard } from './dashboard/server';
import { bots } from './registry';
import type { BotEvent, Command } from './types';

/** commands/<klasör> → modül adı */
const MODULE_OF_DIR: Record<string, string> = {
  system: 'core',
  general: 'core',
  moderation: 'moderation',
  guard: 'guard',
  level: 'level',
  economy: 'economy',
  fun: 'fun',
  tools: 'tools',
  register: 'register',
  stats: 'stats',
  jail: 'jail',
  rooms: 'rooms',
  notify: 'notify',
  spotify: 'spotify',
};

const isCode = (f: string) => /\.(ts|js)$/.test(f) && !f.endsWith('.d.ts');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : isCode(e.name) ? [p] : [];
  });
}

const commandFiles = walk(path.join(__dirname, 'commands'));
const eventFiles = walk(path.join(__dirname, 'events'));

async function createBot(def: BotDef): Promise<Client> {
  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildInvites,
  ];
  // Presence Intent ayrıcalıklıdır; sadece spotify modülü verilen bot için istenir.
  if (def.modules.includes('spotify')) intents.push(GatewayIntentBits.GuildPresences);

  const client = new Client({
    intents,
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
  });

  client.botName = def.name;
  client.modules = new Set(def.modules);
  client.commands = new Collection<string, Command>();

  for (const file of commandFiles) {
    const mod = MODULE_OF_DIR[path.basename(path.dirname(file))];
    if (!mod || !client.modules.has(mod)) continue;
    // Bir dosya tek komut ya da komut dizisi export edebilir
    for (const cmd of [require(file).default as Command | Command[]].flat()) client.commands.set(cmd.data.name, cmd);
  }

  for (const file of eventFiles) {
    const exported = require(file).default as BotEvent | BotEvent[];
    for (const ev of [exported].flat()) {
      const run = (...args: unknown[]) => Promise.resolve(ev.execute(...args)).catch((e) => console.error(`[${def.name}:${ev.name}]`, e));
      if (ev.once) client.once(ev.name, run);
      else client.on(ev.name, run);
    }
  }

  await client.login(def.token);
  bots.push({ ...def, client });
  return client;
}

process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));

(async () => {
  for (const def of config.bots) {
    try {
      await createBot(def);
    } catch (e) {
      console.error(`[HATA] ${def.name} başlatılamadı (token/intent kontrol et):`, e instanceof Error ? e.message : e);
    }
  }
  if (!bots.length) {
    console.error('[HATA] Hiçbir bot başlatılamadı.');
    process.exit(1);
  }
  startDashboard(bots[0].client);
})();
