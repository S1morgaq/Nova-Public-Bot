import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';
import { deleted, edited } from '../../utils/snipe';

const command: Command = {
  category: 'Araçlar',
  aliases: ['sn'],
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Bu kanalda son silinen veya düzenlenen mesajı gösterir (son 10).')
    .addStringOption((o) => o.setName('tur').setDescription('Hangisi?').addChoices({ name: 'Silinen', value: 'silinen' }, { name: 'Düzenlenen', value: 'duzenlenen' }))
    .addIntegerOption((o) => o.setName('sira').setDescription('Kaç mesaj öncesi (1 = en son)').setMinValue(1).setMaxValue(10))
    .setDMPermission(false),
  async execute(i) {
    const isEdit = i.options.getString('tur') === 'duzenlenen';
    const list = (isEdit ? edited : deleted).get(i.channelId) ?? [];
    const n = i.options.getInteger('sira') ?? 1;
    const s = list[n - 1];
    if (!s) return i.reply({ embeds: [err(list.length ? `Bu kanalda sadece ${list.length} kayıt var.` : `Bu kanalda yakın zamanda ${isEdit ? 'düzenlenen' : 'silinen'} mesaj yok.`)], ephemeral: true });

    const e = new EmbedBuilder()
      .setColor(isEdit ? Colors.warn : Colors.error)
      .setAuthor({ name: s.authorTag, iconURL: s.authorAvatar || undefined })
      .setTimestamp(s.at)
      .setFooter({ text: `${isEdit ? 'Düzenlenen' : 'Silinen'} mesaj ${n}/${list.length}` });
    if (isEdit) e.addFields({ name: 'Önce', value: s.before || '—' }, { name: 'Sonra', value: s.content || '—' });
    else e.setDescription(s.content || '*(sadece dosya)*');
    if (s.image) e.setImage(s.image);
    return i.reply({ embeds: [e], allowedMentions: { parse: [] } });
  },
};

export default command;
