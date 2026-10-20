import { PermissionFlagsBits, SlashCommandBuilder, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['sil', 'clear', 'purge'],
  data: new SlashCommandBuilder()
    .setName('temizle')
    .setDescription('Kanaldaki mesajları toplu siler.')
    .addIntegerOption((o) => o.setName('adet').setDescription('1-100').setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption((o) => o.setName('kullanici').setDescription('Sadece bu üyenin mesajlarını sil'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(i) {
    const channel = i.channel as TextChannel;
    const target = i.options.getUser('kullanici');
    let messages = await channel.messages.fetch({ limit: 100 });
    if (target) messages = messages.filter((m) => m.author.id === target.id);
    const deleted = await channel.bulkDelete([...messages.values()].slice(0, i.options.getInteger('adet', true)), true).catch(() => null);
    if (!deleted) return i.reply({ embeds: [err('Mesajlar silinemedi.')], ephemeral: true });
    return i.reply({ embeds: [ok(`${deleted.size} mesaj silindi. (14 günden eski mesajlar silinemez)`)], ephemeral: true });
  },
};

export default command;
