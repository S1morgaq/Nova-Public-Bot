import { EmbedBuilder, PermissionFlagsBits, type AuditLogEvent, type Guild, type User } from 'discord.js';
import { getGuild } from '../db';
import { bots } from '../registry';
import { Colors } from './embed';
import { sendLog } from './log';

/** Verilirse sunucuyu ele geçirmeye yarayabilecek izinler. */
export const DANGEROUS =
  PermissionFlagsBits.Administrator |
  PermissionFlagsBits.ManageGuild |
  PermissionFlagsBits.ManageRoles |
  PermissionFlagsBits.ManageChannels |
  PermissionFlagsBits.ManageWebhooks |
  PermissionFlagsBits.BanMembers |
  PermissionFlagsBits.KickMembers;

export const isDangerous = (bits: bigint) => (bits & DANGEROUS) !== 0n;

/** Guard modülü bu bot örneğinde ve bu sunucuda açık mı? */
export const guardActive = (guild: Guild) => guild.client.modules.has('guard') && getGuild(guild.id).guard.enabled;

/** İşlemi yapanı denetim kaydından bulur (kayıt birkaç yüz ms gecikebilir). */
export async function executorOf(guild: Guild, type: AuditLogEvent, targetId: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 700));
  const logs = await guild.fetchAuditLogs({ type, limit: 6 }).catch(() => null);
  const entry = logs?.entries.find((e) => e.targetId === targetId && Date.now() - e.createdTimestamp < 15_000);
  return entry?.executor ? (entry.executor as User) : null;
}

/** Sahip, bu botlar ve beyaz listedekiler güvenlidir. */
export function isSafe(guild: Guild, userId: string): boolean {
  return userId === guild.ownerId || bots.some((b) => b.clientId === userId) || getGuild(guild.id).guard.whitelist.includes(userId);
}

/** Koruma aktifse ve işlemi yapan güvenli değilse yapanı döner. */
export async function offender(guild: Guild, type: AuditLogEvent, targetId: string): Promise<User | null> {
  if (!guardActive(guild)) return null;
  const user = await executorOf(guild, type, targetId);
  return user && !isSafe(guild, user.id) ? user : null;
}

export async function punish(guild: Guild, userId: string, reason: string): Promise<void> {
  const { punishment } = getGuild(guild.id).guard;
  const member = await guild.members.fetch(userId).catch(() => null);
  try {
    if (punishment === 'ban') await guild.members.ban(userId, { reason: `Guard: ${reason}` });
    else if (punishment === 'kick') await member?.kick(`Guard: ${reason}`);
    else if (member) await member.roles.remove(member.roles.cache.filter((r) => r.id !== guild.id && !r.managed && r.editable), `Guard: ${reason}`);
  } catch {
    /* hiyerarşi nedeniyle uygulanamadı; yine de loglanır */
  }
  await sendLog(guild, new EmbedBuilder().setColor(Colors.error).setTitle('🛡️ Guard').setDescription(`<@${userId}> cezalandırıldı (**${punishment}**)\n**Sebep:** ${reason}`), 'guard');
}

const counters = new Map<string, number[]>();

/** Son 60 sn içindeki işlem sayısı limiti aştı mı? */
export function overLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const list = (counters.get(key) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  counters.set(key, list);
  return list.length > limit;
}
