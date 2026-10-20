import { EmbedBuilder, PermissionFlagsBits, type Message } from 'discord.js';
import { getGuild, getUser, touch } from '../db';
import type { BotEvent } from '../types';
import { Colors, embed, formatDuration } from '../utils/embed';
import { xpNeeded } from '../utils/level';
import { sendLog } from '../utils/log';
import { ignoreSnipe } from '../utils/snipe';
import { handlePrefixMessage } from '../utils/prefix';

const INVITE = /(discord\.(gg|com\/invite)|discordapp\.com\/invite)\/[a-z0-9-]+/i;
const LINK = /https?:\/\/\S+/i;
const spamMap = new Map<string, number[]>();

function violation(msg: Message<true>): string | null {
  const { automod } = getGuild(msg.guildId);
  const text = msg.content;
  if (automod.invites && INVITE.test(text)) return 'Davet linki';
  if (automod.links && LINK.test(text)) return 'Link';
  if (automod.caps) {
    const letters = text.replace(/[^\p{L}]/gu, '');
    if (letters.length >= 10 && letters.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.7) return 'Aşırı büyük harf';
  }
  if (automod.badWords.length) {
    const lower = text.toLocaleLowerCase('tr');
    if (automod.badWords.some((w) => lower.includes(w))) return 'Yasaklı kelime';
  }
  if (automod.spam) {
    const key = `${msg.guildId}:${msg.author.id}`;
    const now = Date.now();
    const times = (spamMap.get(key) ?? []).filter((t) => now - t < 5000);
    times.push(now);
    spamMap.set(key, times);
    if (times.length >= 6) return 'Spam';
  }
  return null;
}

async function handleAfk(msg: Message<true>): Promise<void> {
  const me = getUser(msg.guildId, msg.author.id);
  if (me.afk) {
    const away = formatDuration(Date.now() - me.afk.since);
    me.afk = null;
    touch();
    const m = await msg.reply({ content: `👋 Tekrar hoş geldin! **${away}** AFK kaldın.`, allowedMentions: { repliedUser: false } }).catch(() => null);
    setTimeout(() => m?.delete().catch(() => null), 6000);
  }
  for (const user of msg.mentions.users.values()) {
    const afk = getUser(msg.guildId, user.id).afk;
    if (afk && user.id !== msg.author.id) {
      await msg.reply({ content: `💤 **${user.username}** AFK: ${afk.reason} (<t:${Math.floor(afk.since / 1000)}:R>)`, allowedMentions: { parse: [], repliedUser: false } }).catch(() => null);
    }
  }
}

const lastAutoReply = new Map<string, number>();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function handleAutoResponse(msg: Message<true>): Promise<void> {
  const responses = getGuild(msg.guildId).autoResponses;
  const triggers = Object.keys(responses);
  if (!triggers.length || !msg.content || Date.now() - (lastAutoReply.get(msg.channelId) ?? 0) < 5000) return;
  const hit = triggers.find((t) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(t)}($|[^\\p{L}\\p{N}])`, 'iu').test(msg.content));
  if (!hit) return;
  lastAutoReply.set(msg.channelId, Date.now());
  await msg.channel.send({ content: responses[hit].replaceAll('{user}', `<@${msg.author.id}>`), allowedMentions: { users: [msg.author.id] } }).catch(() => null);
}

const event: BotEvent = {
  name: 'messageCreate',
  async execute(msg: Message) {
    if (!msg.inGuild() || msg.author.bot) return;

    const mods = msg.client.modules;
    const exempt = msg.member?.permissions.has(PermissionFlagsBits.ManageMessages);
    if (mods.has('moderation') && !exempt) {
      const reason = violation(msg);
      if (reason) {
        ignoreSnipe.add(msg.id);
        await msg.delete().catch(() => ignoreSnipe.delete(msg.id));
        const warn = await msg.channel.send({ embeds: [embed(Colors.warn, `${msg.author}, mesajın **${reason}** nedeniyle silindi.`)] }).catch(() => null);
        setTimeout(() => warn?.delete().catch(() => null), 5000);
        await sendLog(
          msg.guild,
          new EmbedBuilder().setColor(Colors.warn).setTitle('🛡️ AutoMod').setDescription(`${msg.author} • ${msg.channel}\n**Sebep:** ${reason}\n\`\`\`${msg.content.slice(0, 500)}\`\`\``),
        );
        return;
      }
    }

    if (await handlePrefixMessage(msg)) return;
    if (mods.has('tools')) {
      await handleAfk(msg);
      await handleAutoResponse(msg);
    }

    if (!mods.has('level') || !getGuild(msg.guildId).levelEnabled) return;
    const user = getUser(msg.guildId, msg.author.id);
    user.messages++;
    if (Date.now() - user.lastXp >= 60_000) {
      user.lastXp = Date.now();
      user.xp += 15 + Math.floor(Math.random() * 11);
      let leveled = false;
      while (user.xp >= xpNeeded(user.level)) {
        user.xp -= xpNeeded(user.level);
        user.level++;
        leveled = true;
      }
      if (leveled && msg.member) {
        const rewards = Object.entries(getGuild(msg.guildId).levelRoles).filter(([lvl, roleId]) => Number(lvl) <= user.level && !msg.member!.roles.cache.has(roleId));
        for (const [, roleId] of rewards) await msg.member.roles.add(roleId, 'Seviye ödülü').catch(() => null);
      }
      if (leveled) await msg.channel.send({ embeds: [embed(Colors.success, `🎉 ${msg.author} tebrikler, **${user.level}. seviyeye** ulaştın!`)] }).catch(() => null);
    }
    touch();
  },
};

export default event;
