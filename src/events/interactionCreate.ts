import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  type ButtonInteraction,
  type GuildMember,
  type Interaction,
  type TextChannel,
} from 'discord.js';
import { getGuild, giveaways } from '../db';
import type { BotEvent } from '../types';
import { EPH, err, info, ok } from '../utils/embed';
import { giveawayEmbed } from '../utils/giveaway';

async function openTicket(i: ButtonInteraction) {
  const guild = i.guild!;
  const settings = getGuild(guild.id);
  const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildText && (c as TextChannel).topic === `ticket:${i.user.id}`);
  if (existing) return i.reply({ embeds: [err(`Zaten açık bir ticketın var: ${existing}`)], flags: EPH });

  const allow = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles];
  const channel = await guild.channels.create({
    name: `ticket-${i.user.username}`.slice(0, 90),
    type: ChannelType.GuildText,
    topic: `ticket:${i.user.id}`,
    parent: settings.ticketCategory ?? undefined,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: i.user.id, allow },
      ...(settings.ticketStaffRole ? [{ id: settings.ticketStaffRole, allow }] : []),
      { id: guild.members.me!.id, allow: [...allow, PermissionFlagsBits.ManageChannels] },
    ],
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Ticketı Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger),
  );
  await channel.send({
    content: `${i.user}${settings.ticketStaffRole ? ` <@&${settings.ticketStaffRole}>` : ''}`,
    embeds: [info('Sorununu yaz, yetkililer en kısa sürede ilgilenecek.\nİşin bitince aşağıdaki butonla ticketı kapatabilirsin.', '🎫 Destek Talebi')],
    components: [row],
  });
  return i.reply({ embeds: [ok(`Ticketın açıldı: ${channel}`)], flags: EPH });
}

async function closeTicket(i: ButtonInteraction) {
  const channel = i.channel as TextChannel;
  const settings = getGuild(i.guildId!);
  const member = i.member as GuildMember;
  const isOwner = channel.topic === `ticket:${i.user.id}`;
  const isStaff = (settings.ticketStaffRole && member.roles.cache.has(settings.ticketStaffRole)) || member.permissions.has(PermissionFlagsBits.ManageChannels);
  if (!isOwner && !isStaff) return i.reply({ embeds: [err('Bu ticketı kapatma yetkin yok.')], flags: EPH });
  await i.reply({ embeds: [info('🔒 Ticket 5 saniye içinde kapatılıyor...')] });

  const history = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (history) {
    const text = [...history.values()]
      .reverse()
      .map((m) => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}${m.attachments.size ? ' ' + m.attachments.map((a) => a.url).join(' ') : ''}`)
      .join('\n');
    const file = new AttachmentBuilder(Buffer.from(text || '(boş)', 'utf8'), { name: `${channel.name}.txt` });
    const logCh = settings.logChannel ? i.guild!.channels.cache.get(settings.logChannel) : null;
    if (logCh?.isTextBased()) await logCh.send({ content: `🎫 **${channel.name}** kapatıldı (${i.user}).`, files: [file] }).catch(() => null);
    const ownerId = channel.topic?.replace('ticket:', '');
    const owner = ownerId ? await i.client.users.fetch(ownerId).catch(() => null) : null;
    await owner?.send({ content: `**${i.guild!.name}** ticket kaydın:`, files: [file] }).catch(() => null);
  }
  setTimeout(() => channel.delete().catch(() => null), 5000);
}

async function joinGiveaway(i: ButtonInteraction) {
  const g = giveaways.get(i.message.id);
  if (!g || g.ended) return i.reply({ embeds: [err('Bu çekiliş sona erdi.')], flags: EPH });
  const idx = g.participants.indexOf(i.user.id);
  if (idx >= 0) g.participants.splice(idx, 1);
  else g.participants.push(i.user.id);
  giveaways.save();
  await i.update({ embeds: [giveawayEmbed(g)] });
  await i.followUp({ embeds: [ok(idx >= 0 ? 'Çekilişten ayrıldın.' : 'Çekilişe katıldın, bol şans!')], flags: EPH });
}

async function toggleRole(i: ButtonInteraction) {
  const roleId = i.customId.slice(3);
  const member = i.member as GuildMember;
  const role = i.guild!.roles.cache.get(roleId);
  if (!role) return i.reply({ embeds: [err('Bu rol artık yok.')], flags: EPH });
  if (role.position >= i.guild!.members.me!.roles.highest.position) return i.reply({ embeds: [err('Bu rolü veremem, rolüm yeterince yüksek değil.')], flags: EPH });
  const has = member.roles.cache.has(roleId);
  await (has ? member.roles.remove(role) : member.roles.add(role));
  return i.reply({ embeds: [ok(has ? `**${role.name}** rolü alındı.` : `**${role.name}** rolü verildi.`)], flags: EPH });
}

async function verifyMember(i: ButtonInteraction) {
  const role = i.guild!.roles.cache.get(i.customId.slice(7));
  const member = i.member as GuildMember;
  if (!role) return i.reply({ embeds: [err('Doğrulama rolü artık yok.')], flags: EPH });
  if (member.roles.cache.has(role.id)) return i.reply({ embeds: [ok('Zaten doğrulanmışsın.')], flags: EPH });
  await member.roles.add(role, 'Doğrulama butonu');
  return i.reply({ embeds: [ok('Doğrulandın, hoş geldin! 🎉')], flags: EPH });
}

const event: BotEvent = {
  name: 'interactionCreate',
  async execute(i: Interaction) {
    try {
      if (i.isChatInputCommand()) {
        const cmd = i.client.commands.get(i.commandName);
        if (cmd) await cmd.execute(i);
      } else if (i.isButton() && i.inGuild()) {
        if (i.customId === 'ticket_open') await openTicket(i);
        else if (i.customId === 'ticket_close') await closeTicket(i);
        else if (i.customId === 'gw_join') await joinGiveaway(i);
        else if (i.customId.startsWith('rr:')) await toggleRole(i);
        else if (i.customId.startsWith('verify:')) await verifyMember(i);
      }
    } catch (e) {
      console.error('[interaction]', e);
      if (i.isRepliable()) {
        const payload = { embeds: [err('Bir hata oluştu, lütfen tekrar dene.')], flags: EPH } as const;
        if (i.replied || i.deferred) await i.followUp(payload).catch(() => null);
        else await i.reply(payload).catch(() => null);
      }
    }
  },
};

export default event;
