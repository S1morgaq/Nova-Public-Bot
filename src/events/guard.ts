import {
  AuditLogEvent,
  type Guild,
  type GuildBan,
  type GuildChannel,
  type GuildChannelCreateOptions,
  type GuildMember,
  type NonThreadGuildBasedChannel,
  type PartialGuildMember,
  type Role,
} from 'discord.js';
import { getGuild } from '../db';
import type { BotEvent } from '../types';
import { guardActive, isDangerous, offender, overLimit, punish } from '../utils/guard';

/** Silinen kanalı ayarlarıyla birlikte yeniden oluşturur. */
async function recreate(channel: GuildChannel) {
  const opts = {
    name: channel.name,
    type: channel.type,
    parent: channel.parentId,
    position: channel.rawPosition,
    permissionOverwrites: channel.permissionOverwrites.cache.map((o) => ({ id: o.id, type: o.type, allow: o.allow, deny: o.deny })),
  } as GuildChannelCreateOptions & { topic?: string; nsfw?: boolean; bitrate?: number; userLimit?: number };
  if (channel.isTextBased() && 'topic' in channel) {
    opts.topic = channel.topic ?? undefined;
    opts.nsfw = channel.nsfw;
  }
  if (channel.isVoiceBased()) {
    opts.bitrate = Math.min(channel.bitrate, channel.guild.maximumBitrate);
    opts.userLimit = channel.userLimit;
  }
  await channel.guild.channels.create(opts).catch(() => null);
}

const events: BotEvent[] = [
  {
    name: 'channelDelete',
    async execute(channel: NonThreadGuildBasedChannel) {
      const who = await offender(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
      if (!who) return;
      await punish(channel.guild, who.id, `Kanal sildi: #${channel.name}`);
      await recreate(channel);
    },
  },
  {
    name: 'channelCreate',
    async execute(channel: GuildChannel) {
      const who = await offender(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
      if (!who) return;
      await punish(channel.guild, who.id, `İzinsiz kanal açtı: #${channel.name}`);
      await channel.delete('Guard: izinsiz kanal').catch(() => null);
    },
  },
  {
    name: 'roleDelete',
    async execute(role: Role) {
      if (role.managed) return;
      const who = await offender(role.guild, AuditLogEvent.RoleDelete, role.id);
      if (!who) return;
      await punish(role.guild, who.id, `Rol sildi: ${role.name}`);
      await role.guild.roles.create({ name: role.name, color: role.color, hoist: role.hoist, mentionable: role.mentionable, permissions: role.permissions, reason: 'Guard: silinen rol geri açıldı' }).catch(() => null);
    },
  },
  {
    name: 'roleCreate',
    async execute(role: Role) {
      if (role.managed) return;
      const who = await offender(role.guild, AuditLogEvent.RoleCreate, role.id);
      if (!who) return;
      await punish(role.guild, who.id, `İzinsiz rol açtı: ${role.name}`);
      await role.delete('Guard: izinsiz rol').catch(() => null);
    },
  },
  {
    name: 'roleUpdate',
    async execute(oldRole: Role, newRole: Role) {
      if (newRole.managed) return;
      const added = newRole.permissions.bitfield & ~oldRole.permissions.bitfield;
      if (!isDangerous(added)) return;
      const who = await offender(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
      if (!who) return;
      await newRole.setPermissions(oldRole.permissions, 'Guard: tehlikeli izin geri alındı').catch(() => null);
      await punish(newRole.guild, who.id, `Role tehlikeli izin ekledi: ${newRole.name}`);
    },
  },
  {
    name: 'guildMemberUpdate',
    async execute(oldM: GuildMember | PartialGuildMember, newM: GuildMember) {
      if (!guardActive(newM.guild)) return;
      const dangerous = newM.roles.cache.filter((r) => !oldM.roles?.cache.has(r.id) && !r.managed && isDangerous(r.permissions.bitfield));
      if (!dangerous.size) return;
      const who = await offender(newM.guild, AuditLogEvent.MemberRoleUpdate, newM.id);
      if (!who) return;
      await newM.roles.remove(dangerous, 'Guard: izinsiz tehlikeli rol').catch(() => null);
      await punish(newM.guild, who.id, `${newM.user.tag} üyesine tehlikeli rol verdi`);
    },
  },
  {
    name: 'guildBanAdd',
    async execute(ban: GuildBan) {
      const who = await offender(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
      if (!who || !overLimit(`${ban.guild.id}:${who.id}:ban`, getGuild(ban.guild.id).guard.limit)) return;
      await ban.guild.members.unban(ban.user.id, 'Guard: ban limiti aşıldı').catch(() => null);
      await punish(ban.guild, who.id, 'Ban limitini aştı');
    },
  },
  {
    name: 'guildMemberRemove',
    async execute(member: GuildMember | PartialGuildMember) {
      const who = await offender(member.guild, AuditLogEvent.MemberKick, member.id);
      if (!who || !overLimit(`${member.guild.id}:${who.id}:kick`, getGuild(member.guild.id).guard.limit)) return;
      await punish(member.guild, who.id, 'Kick limitini aştı');
    },
  },
  {
    name: 'guildMemberAdd',
    async execute(member: GuildMember) {
      if (!member.user.bot) return;
      const who = await offender(member.guild, AuditLogEvent.BotAdd, member.id);
      if (!who) return;
      await member.kick('Guard: izinsiz bot').catch(() => null);
      await punish(member.guild, who.id, `İzinsiz bot ekledi: ${member.user.tag}`);
    },
  },
  {
    name: 'guildUpdate',
    async execute(oldG: Guild, newG: Guild) {
      if (oldG.name === newG.name || !guardActive(newG)) return;
      const who = await offender(newG, AuditLogEvent.GuildUpdate, newG.id);
      if (!who) return;
      await newG.setName(oldG.name, 'Guard: sunucu adı geri alındı').catch(() => null);
      await punish(newG, who.id, 'Sunucu adını değiştirdi');
    },
  },
];

export default events;
