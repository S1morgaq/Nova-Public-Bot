import { EmbedBuilder, type GuildMember } from 'discord.js';
import { getGuild, getUser, jails, touch, type AntiRaid } from '../db';
import type { BotEvent } from '../types';
import { Colors } from '../utils/embed';
import { findUsedInvite } from '../utils/invites';
import { sendLog } from '../utils/log';

/** Değişkenler: {user} {server} {count} {inviter} {invites} */
export const fillTemplate = (tpl: string, m: GuildMember, inviter: string | null = null) =>
  tpl
    .replaceAll('{user}', `<@${m.id}>`)
    .replaceAll('{server}', m.guild.name)
    .replaceAll('{count}', String(m.guild.memberCount))
    .replaceAll('{inviter}', inviter ? `<@${inviter}>` : 'bilinmiyor')
    .replaceAll('{invites}', String(inviter ? getUser(m.guild.id, inviter).invites ?? 0 : 0));

const recentJoins = new Map<string, { id: string; at: number }[]>();

/** Raid tespit edilirse üyeyi atar ve true döner. */
async function antiRaid(member: GuildMember, cfg: AntiRaid): Promise<boolean> {
  const dm = (reason: string) => member.send(`**${member.guild.name}** sunucusuna şu an giriş yapamazsın: ${reason}`).catch(() => null);

  const ageDays = (Date.now() - member.user.createdTimestamp) / 86_400_000;
  if (cfg.minAccountDays > 0 && ageDays < cfg.minAccountDays) {
    await dm(`hesabın en az ${cfg.minAccountDays} günlük olmalı.`);
    await member.kick('Anti-raid: hesap çok yeni').catch(() => null);
    await sendLog(member.guild, new EmbedBuilder().setColor(Colors.warn).setTitle('🚨 Anti-Raid').setDescription(`${member.user.tag} yeni hesap (${ageDays.toFixed(1)} gün) olduğu için atıldı.`));
    return true;
  }

  const now = Date.now();
  const list = (recentJoins.get(member.guild.id) ?? []).filter((j) => now - j.at < cfg.seconds * 1000);
  list.push({ id: member.id, at: now });
  recentJoins.set(member.guild.id, list);
  if (list.length < cfg.joins) return false;

  // Eşik aşıldı: penceredeki herkesi at (en son girenler dahil)
  for (const j of list) {
    const m = member.guild.members.cache.get(j.id);
    if (m?.kickable) {
      await m.send(`**${member.guild.name}** sunucusunda raid koruması aktif, lütfen daha sonra tekrar dene.`).catch(() => null);
      await m.kick('Anti-raid: toplu giriş').catch(() => null);
    }
  }
  if (list.length === cfg.joins) {
    await sendLog(member.guild, new EmbedBuilder().setColor(Colors.error).setTitle('🚨 Raid Algılandı').setDescription(`${cfg.seconds} sn içinde ${cfg.joins}+ giriş. Girenler atıldı, koruma devam ediyor.`));
  }
  return true;
}

const event: BotEvent = {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    const mods = member.client.modules;
    const s = getGuild(member.guild.id);

    if (mods.has('guard') && s.antiRaid.enabled && !member.user.bot && (await antiRaid(member, s.antiRaid))) return;

    // Cezalıyken sunucudan çıkıp girenlere jail rolünü tekrar ver
    if (mods.has('jail') && s.jailRole && jails.get(member.guild.id, member.id)) {
      await member.roles.add(s.jailRole, 'Jail kaçağı').catch(() => null);
    }

    let inviter: string | null = null;
    if (mods.has('welcome')) {
      // Hangi davetle geldi? (sunucuyu yönet yetkisi yoksa bulunamaz)
      const used = member.user.bot ? null : await findUsedInvite(member.guild);
      if (used?.inviterId && used.inviterId !== member.id) {
        inviter = used.inviterId;
        const inv = getUser(member.guild.id, inviter);
        inv.invites = (inv.invites ?? 0) + 1;
        getUser(member.guild.id, member.id).invitedBy = inviter;
        touch();
      }
      if (s.autoRole) await member.roles.add(s.autoRole).catch(() => null);
      if (s.registerUnregRole) await member.roles.add(s.registerUnregRole).catch(() => null);
      if (s.welcomeChannel) {
        const ch = member.guild.channels.cache.get(s.welcomeChannel);
        if (ch?.isTextBased()) {
          await ch.send({
            embeds: [new EmbedBuilder().setColor(Colors.success).setDescription(fillTemplate(s.welcomeMessage, member, inviter)).setThumbnail(member.displayAvatarURL())],
          }).catch(() => null);
        }
      }
    }

    if (mods.has('logs')) {
      await sendLog(member.guild, new EmbedBuilder().setColor(Colors.success).setTitle('📥 Üye Katıldı').setDescription(`${member} (${member.user.tag})\nHesap: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`), 'member');
    }
  },
};

export default event;
