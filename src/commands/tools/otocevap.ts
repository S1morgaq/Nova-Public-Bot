import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild, updateGuild } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['autoresponse', 'otoyanit'],
  data: new SlashCommandBuilder()
    .setName('otocevap')
    .setDescription('Bir kelime yazılınca bot otomatik cevap versin. Yanıtta {user} kullanılabilir.')
    .addSubcommand((s) =>
      s
        .setName('ekle')
        .setDescription('Otomatik cevap ekler.')
        .addStringOption((o) => o.setName('tetik').setDescription('Tetikleyen kelime/ifade').setRequired(true).setMaxLength(50))
        .addStringOption((o) => o.setName('yanit').setDescription('Botun yanıtı').setRequired(true).setMaxLength(1500)),
    )
    .addSubcommand((s) => s.setName('sil').setDescription('Otomatik cevabı siler.').addStringOption((o) => o.setName('tetik').setDescription('Tetikleyen kelime').setRequired(true).setMaxLength(50)))
    .addSubcommand((s) => s.setName('liste').setDescription('Otomatik cevapları listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const current = getGuild(i.guildId!).autoResponses;
    const sub = i.options.getSubcommand();
    if (sub === 'liste') {
      const lines = Object.entries(current).map(([t, r]) => `**${t}** → ${r.slice(0, 60)}`);
      return i.reply({ embeds: [info(lines.join('\n') || 'Hiç otomatik cevap yok.', 'Otomatik Cevaplar')] });
    }
    const trigger = i.options.getString('tetik', true).toLocaleLowerCase('tr').trim();
    if (sub === 'sil') {
      if (!(trigger in current)) return i.reply({ embeds: [err('Böyle bir tetik yok.')], ephemeral: true });
      const { [trigger]: _gone, ...rest } = current;
      updateGuild(i.guildId!, { autoResponses: rest });
      return i.reply({ embeds: [ok(`\`${trigger}\` silindi.`)] });
    }
    if (Object.keys(current).length >= 50 && !(trigger in current)) return i.reply({ embeds: [err('En fazla 50 otomatik cevap eklenebilir.')], ephemeral: true });
    updateGuild(i.guildId!, { autoResponses: { ...current, [trigger]: i.options.getString('yanit', true) } });
    return i.reply({ embeds: [ok(`\`${trigger}\` yazılınca artık cevap vereceğim.`)] });
  },
};

export default command;
