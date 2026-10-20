import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild, updateGuild } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['customcommand', 'cc', 'tag'],
  data: new SlashCommandBuilder()
    .setName('ozelkomut')
    .setDescription('Sunucuya özel prefix komutları. Yanıtta {user} ve {server} kullanılabilir.')
    .addSubcommand((s) =>
      s
        .setName('ekle')
        .setDescription('Komut ekler.')
        .addStringOption((o) => o.setName('ad').setDescription('Komut adı').setRequired(true).setMaxLength(32))
        .addStringOption((o) => o.setName('yanit').setDescription('Verilecek yanıt').setRequired(true).setMaxLength(1500)),
    )
    .addSubcommand((s) => s.setName('sil').setDescription('Komutu siler.').addStringOption((o) => o.setName('ad').setDescription('Komut adı').setRequired(true)))
    .addSubcommand((s) => s.setName('liste').setDescription('Özel komutları listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const s = getGuild(i.guildId!);
    const sub = i.options.getSubcommand();
    if (sub === 'liste') {
      const names = Object.keys(s.customCommands);
      return i.reply({ embeds: [info(names.map((n) => `\`${s.prefix}${n}\``).join('\n') || 'Hiç özel komut yok.', 'Özel Komutlar')] });
    }
    const name = i.options.getString('ad', true).toLowerCase().replace(/\s+/g, '');
    if (sub === 'ekle') {
      if (i.client.commands.has(name) || i.client.commands.some((c) => c.aliases?.includes(name))) return i.reply({ embeds: [err('Bu isim hazır bir komutla çakışıyor.')], ephemeral: true });
      if (Object.keys(s.customCommands).length >= 50) return i.reply({ embeds: [err('En fazla 50 özel komut eklenebilir.')], ephemeral: true });
      updateGuild(i.guildId!, { customCommands: { ...s.customCommands, [name]: i.options.getString('yanit', true) } });
      return i.reply({ embeds: [ok(`\`${s.prefix}${name}\` eklendi.`)] });
    }
    if (!(name in s.customCommands)) return i.reply({ embeds: [err('Böyle bir özel komut yok.')], ephemeral: true });
    const { [name]: _removed, ...rest } = s.customCommands;
    updateGuild(i.guildId!, { customCommands: rest });
    return i.reply({ embeds: [ok(`\`${name}\` silindi.`)] });
  },
};

export default command;
