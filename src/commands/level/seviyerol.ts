import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild, updateGuild } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Seviye',
  aliases: ['levelrole'],
  data: new SlashCommandBuilder()
    .setName('seviyerol')
    .setDescription('Belirli seviyeye ulaşanlara otomatik rol ver.')
    .addSubcommand((s) =>
      s
        .setName('ekle')
        .setDescription('Seviye ödülü rolü ekler.')
        .addIntegerOption((o) => o.setName('seviye').setDescription('Gereken seviye').setMinValue(1).setMaxValue(500).setRequired(true))
        .addRoleOption((o) => o.setName('rol').setDescription('Verilecek rol').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('sil').setDescription('Seviye ödülünü siler.').addIntegerOption((o) => o.setName('seviye').setDescription('Seviye').setRequired(true)))
    .addSubcommand((s) => s.setName('liste').setDescription('Seviye ödüllerini listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const roles = getGuild(i.guildId!).levelRoles;
    const sub = i.options.getSubcommand();
    if (sub === 'liste') {
      const lines = Object.entries(roles).sort((a, b) => Number(a[0]) - Number(b[0])).map(([l, r]) => `**Seviye ${l}** → <@&${r}>`);
      return i.reply({ embeds: [info(lines.join('\n') || 'Hiç seviye ödülü yok.', 'Seviye Rolleri')], allowedMentions: { parse: [] } });
    }
    const level = String(i.options.getInteger('seviye', true));
    if (sub === 'sil') {
      if (!(level in roles)) return i.reply({ embeds: [err('Bu seviyede ödül yok.')], ephemeral: true });
      const { [level]: _gone, ...rest } = roles;
      updateGuild(i.guildId!, { levelRoles: rest });
      return i.reply({ embeds: [ok(`Seviye ${level} ödülü silindi.`)] });
    }
    const role = i.options.getRole('rol', true);
    updateGuild(i.guildId!, { levelRoles: { ...roles, [level]: role.id } });
    return i.reply({ embeds: [ok(`Seviye **${level}** → ${role}`)], allowedMentions: { parse: [] } });
  },
};

export default command;
