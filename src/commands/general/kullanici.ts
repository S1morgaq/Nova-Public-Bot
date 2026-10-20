import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';

const command: Command = {
  category: 'Genel',
  aliases: ['userinfo', 'ui'],
  data: new SlashCommandBuilder()
    .setName('kullanici')
    .setDescription('Bir üyenin bilgilerini gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const member = await i.guild!.members.fetch(user.id).catch(() => null);
    const t = (ms?: number | null) => (ms ? `<t:${Math.floor(ms / 1000)}:D> (<t:${Math.floor(ms / 1000)}:R>)` : '—');
    const roles = member?.roles.cache.filter((r) => r.id !== i.guildId).sort((a, b) => b.position - a.position).map((r) => r.toString()) ?? [];
    const e = new EmbedBuilder()
      .setColor(member?.displayColor || 0x5865f2)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Hesap oluşturma', value: t(user.createdTimestamp) },
        { name: 'Sunucuya katılma', value: t(member?.joinedTimestamp) },
        { name: `Roller (${roles.length})`, value: roles.slice(0, 15).join(' ') || '—' },
      );
    return i.reply({ embeds: [e] });
  },
};

export default command;
