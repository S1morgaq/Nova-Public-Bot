import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { updateGuild } from '../../db';
import type { Command } from '../../types';
import { info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Sistem',
  data: new SlashCommandBuilder()
    .setName('ticket-kur')
    .setDescription('Destek (ticket) panelini kanala gönderir.')
    .addChannelOption((o) => o.setName('kanal').setDescription('Panelin gönderileceği kanal').addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addRoleOption((o) => o.setName('yetkili_rol').setDescription('Ticketları görecek yetkili rolü').setRequired(true))
    .addChannelOption((o) => o.setName('kategori').setDescription('Ticketların açılacağı kategori').addChannelTypes(ChannelType.GuildCategory))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const channel = i.options.getChannel('kanal', true, [ChannelType.GuildText]);
    const role = i.options.getRole('yetkili_rol', true);
    const category = i.options.getChannel('kategori', false, [ChannelType.GuildCategory]);
    updateGuild(i.guildId!, { ticketStaffRole: role.id, ticketCategory: category?.id ?? null });
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('ticket_open').setLabel('Ticket Aç').setEmoji('🎫').setStyle(ButtonStyle.Primary),
    );
    await channel.send({ embeds: [info('Yardıma mı ihtiyacın var? Aşağıdaki butona tıkla, yetkililerle özel bir kanalda görüş.', '🎫 Destek')], components: [row] });
    return i.reply({ embeds: [ok(`Ticket paneli ${channel} kanalına gönderildi.`)], ephemeral: true });
  },
};

export default command;
