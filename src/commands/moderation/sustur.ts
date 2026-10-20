import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';
import { sendLog } from '../../utils/log';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['mute', 'timeout'],
  data: new SlashCommandBuilder()
    .setName('sustur')
    .setDescription('Bir üyeyi belirli süre susturur (timeout). Süre 0 ise susturmayı kaldırır.')
    .addUserOption((o) => o.setName('kullanici').setDescription('Üye').setRequired(true))
    .addIntegerOption((o) => o.setName('dakika').setDescription('Süre (dakika, en fazla 40320)').setMinValue(0).setMaxValue(40320).setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('kullanici', true);
    const minutes = i.options.getInteger('dakika', true);
    const reason = i.options.getString('sebep') ?? 'Sebep belirtilmedi';
    const member = await i.guild!.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const problem = hierarchyError(i, member);
    if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });
    await member.timeout(minutes ? minutes * 60_000 : null, `${i.user.tag}: ${reason}`);
    await i.reply({ embeds: [ok(minutes ? `**${user.tag}** ${minutes} dakika susturuldu.` : `**${user.tag}** susturması kaldırıldı.`)] });
    await sendLog(i.guild!, new EmbedBuilder().setColor(Colors.warn).setTitle('🔇 Susturma').setDescription(`**Üye:** ${user}\n**Süre:** ${minutes} dk\n**Yetkili:** ${i.user}\n**Sebep:** ${reason}`));
  },
};

export default command;
