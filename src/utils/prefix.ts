import type { ChatInputCommandInteraction, Message, TextChannel } from 'discord.js';
import { getGuild } from '../db';
import type { Command } from '../types';
import { err, info } from './embed';

/**
 * Prefix → slash köprüsü: mesajı, komutun slash tanımına (options) göre ayrıştırıp
 * ChatInputCommandInteraction gibi davranan bir nesneye çevirir. Böylece her komut
 * tek bir execute() ile hem `/komut` hem `!komut` olarak çalışır.
 */

interface OptJson {
  name: string;
  type: number;
  required?: boolean;
  max_length?: number;
  choices?: { name: string; value: string | number }[];
  options?: OptJson[];
}

const SUB = 1;
const STRING = 3, INTEGER = 4, BOOLEAN = 5, USER = 6, CHANNEL = 7, ROLE = 8, MENTIONABLE = 9, NUMBER = 10;

const TRUE = ['evet', 'true', 'on', '1', 'aç', 'ac', 'açık', 'acik', 'yes'];
const FALSE = ['hayır', 'hayir', 'false', 'off', '0', 'kapat', 'kapalı', 'kapali', 'no'];

class UsageError extends Error {}

export function tokenize(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(/"([^"]*)"|(\S+)/g)) out.push(m[1] ?? m[2]);
  return out;
}

function usage(prefix: string, cmd: Command, subs?: OptJson[], opts?: OptJson[], subName?: string): string {
  const fmt = (o: OptJson) => (o.required ? `<${o.name}>` : `[${o.name}]`);
  if (!subName && subs?.length) return subs.map((s) => `\`${prefix}${cmd.data.name} ${s.name} ${(s.options ?? []).map(fmt).join(' ')}\``.replace(' `', '`')).join('\n');
  return `\`${prefix}${cmd.data.name}${subName ? ' ' + subName : ''} ${(opts ?? []).map(fmt).join(' ')}\``.replace(' `', '`');
}

async function parse(msg: Message<true>, cmd: Command, args: string[], prefix: string) {
  const json = cmd.data.toJSON() as unknown as { options?: OptJson[] };
  const all = json.options ?? [];
  const subs = all.filter((o) => o.type === SUB);
  const values = new Map<string, unknown>();
  let sub: string | null = null;
  let opts = all;
  const rest = [...args];

  if (subs.length) {
    const wanted = rest.shift()?.toLowerCase();
    const found = subs.find((s) => s.name === wanted);
    if (!found) throw new UsageError(usage(prefix, cmd, subs));
    sub = found.name;
    opts = found.options ?? [];
  }

  for (let idx = 0; idx < opts.length; idx++) {
    const o = opts[idx];
    if (!rest.length) {
      if (o.required) throw new UsageError(usage(prefix, cmd, subs, opts, sub ?? undefined));
      continue;
    }
    // Serbest metin seçeneği kalan her şeyi alır; kısa (max_length < 100) alanlar tek kelime alır.
    const laterRequired = opts.slice(idx + 1).some((x) => x.required);
    const isLast = idx === opts.length - 1;
    const freeText = o.type === STRING && !o.choices && (isLast || (!laterRequired && (o.max_length ?? 1000) >= 100));
    const raw = freeText ? rest.splice(0).join(' ') : rest.shift()!;
    const bad = (what: string) => new UsageError(`**${o.name}** için geçerli ${what} gir.\n${usage(prefix, cmd, subs, opts, sub ?? undefined)}`);

    try {
    switch (o.type) {
      case STRING: {
        if (o.choices) {
          const c = o.choices.find((c) => String(c.value).toLowerCase() === raw.toLowerCase() || c.name.toLowerCase() === raw.toLowerCase());
          if (!c) throw new UsageError(`**${o.name}** şunlardan biri olmalı: ${o.choices.map((c) => `\`${c.value}\``).join(', ')}`);
          values.set(o.name, c.value);
        } else values.set(o.name, raw);
        break;
      }
      case INTEGER:
      case NUMBER: {
        const n = Number(raw.replace(',', '.'));
        if (!Number.isFinite(n) || (o.type === INTEGER && !Number.isInteger(n))) throw bad('bir sayı');
        values.set(o.name, n);
        break;
      }
      case BOOLEAN: {
        const l = raw.toLowerCase();
        if (TRUE.includes(l)) values.set(o.name, true);
        else if (FALSE.includes(l)) values.set(o.name, false);
        else throw bad('bir değer (evet/hayır)');
        break;
      }
      case USER:
      case MENTIONABLE: {
        const id = raw.match(/^<@!?(\d+)>$/)?.[1] ?? raw.match(/^\d{17,20}$/)?.[0];
        const user = id ? await msg.client.users.fetch(id).catch(() => null) : null;
        if (!user) throw bad('bir üye (etiket veya ID)');
        values.set(o.name, user);
        break;
      }
      case CHANNEL: {
        const id = raw.match(/^<#(\d+)>$/)?.[1] ?? raw.match(/^\d{17,20}$/)?.[0];
        const ch = id ? msg.guild.channels.cache.get(id) : msg.guild.channels.cache.find((c) => c.name === raw.toLowerCase());
        if (!ch) throw bad('bir kanal (#kanal)');
        values.set(o.name, ch);
        break;
      }
      case ROLE: {
        const id = raw.match(/^<@&(\d+)>$/)?.[1] ?? raw.match(/^\d{17,20}$/)?.[0];
        const role = id ? msg.guild.roles.cache.get(id) : msg.guild.roles.cache.find((r) => r.name.toLowerCase() === raw.toLowerCase());
        if (!role) throw bad('bir rol (@rol)');
        values.set(o.name, role);
        break;
      }
    }
    } catch (e) {
      // Atlanabilir seçenek bu kelimeyi kabul etmediyse kelimeyi sıradaki seçeneğe bırak (örn. `.snipe 2`)
      if (!o.required && e instanceof UsageError && !freeText) {
        rest.unshift(raw);
        continue;
      }
      throw e;
    }
  }
  return { values, sub };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clean = (p: any) => {
  const payload = typeof p === 'string' ? { content: p } : { ...p };
  delete payload.flags;
  delete payload.ephemeral;
  delete payload.fetchReply;
  payload.allowedMentions = { repliedUser: false, ...payload.allowedMentions };
  return payload;
};

function buildInteraction(msg: Message<true>, cmd: Command, values: Map<string, unknown>, sub: string | null): ChatInputCommandInteraction {
  let sent: Message | null = null;
  const get = (name: string) => values.get(name) ?? null;
  const shim = {
    commandName: cmd.data.name,
    client: msg.client,
    guild: msg.guild,
    guildId: msg.guildId,
    channel: msg.channel,
    channelId: msg.channelId,
    user: msg.author,
    member: msg.member,
    createdTimestamp: msg.createdTimestamp,
    replied: false,
    deferred: false,
    inGuild: () => true,
    isChatInputCommand: () => true,
    options: {
      getSubcommand: () => sub,
      getString: get,
      getInteger: get,
      getNumber: get,
      getBoolean: get,
      getUser: get,
      getChannel: get,
      getRole: get,
      getMentionable: get,
      getMember: (n: string) => {
        const u = values.get(n) as { id: string } | undefined;
        return u ? msg.guild.members.cache.get(u.id) ?? null : null;
      },
    },
    async reply(p: unknown) {
      shim.replied = true;
      sent = await msg.reply(clean(p)).catch(() => (msg.channel as TextChannel).send(clean(p)));
      return sent;
    },
    async editReply(p: unknown) {
      return sent ? sent.edit(clean(p)) : shim.reply(p);
    },
    async followUp(p: unknown) {
      return (msg.channel as TextChannel).send(clean(p));
    },
    async deferReply() {
      shim.deferred = true;
    },
  };
  return shim as unknown as ChatInputCommandInteraction;
}

export function findCommand(commands: Map<string, Command>, name: string): Command | undefined {
  return commands.get(name) ?? [...commands.values()].find((c) => c.aliases?.includes(name));
}

/** Mesaj bir prefix komutuysa çalıştırır ve true döner. */
export async function handlePrefixMessage(msg: Message): Promise<boolean> {
  if (!msg.inGuild() || msg.author.bot) return false;
  const settings = getGuild(msg.guildId);
  const botMention = new RegExp(`^<@!?${msg.client.user.id}>\\s*`);

  let body: string;
  if (msg.content.startsWith(settings.prefix)) body = msg.content.slice(settings.prefix.length);
  else if (botMention.test(msg.content)) body = msg.content.replace(botMention, '');
  else return false;

  const [first, ...args] = tokenize(body.trim());
  if (!first) return false;
  const name = first.toLowerCase();

  const cmd = findCommand(msg.client.commands, name);
  if (!cmd) {
    const text = msg.client.modules.has('tools') ? settings.customCommands[name] : undefined;
    if (!text) return false;
    await msg.channel.send({ content: text.replaceAll('{user}', `<@${msg.author.id}>`).replaceAll('{server}', msg.guild.name), allowedMentions: { parse: [] } }).catch(() => null);
    return true;
  }

  const json = cmd.data.toJSON();
  if (json.default_member_permissions && !msg.member?.permissions.has(BigInt(json.default_member_permissions))) {
    await msg.reply({ embeds: [err('Bu komutu kullanma yetkin yok.')], allowedMentions: { repliedUser: false } }).catch(() => null);
    return true;
  }

  try {
    const { values, sub } = await parse(msg, cmd, args, settings.prefix);
    await cmd.execute(buildInteraction(msg, cmd, values, sub));
  } catch (e) {
    if (e instanceof UsageError) {
      await msg.reply({ embeds: [info(e.message, 'Kullanım')], allowedMentions: { repliedUser: false } }).catch(() => null);
    } else {
      console.error(`[prefix:${name}]`, e);
      await msg.reply({ embeds: [err('Bir hata oluştu, lütfen tekrar dene.')], allowedMentions: { repliedUser: false } }).catch(() => null);
    }
  }
  return true;
}
