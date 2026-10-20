import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';
import { sendLog } from '../../utils/log';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['ban'],
  data: new SlashCommandBuilder()
    .setName('yasakla')
    .setDescription('Bir üyeyi sunucudan yasaklar.')
    .addUserOption((o) => o.setName('kullanici').setDescription('Yasaklanacak üye').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep'))
    .addIntegerOption((o) => o.setName('mesaj_sil').setDescription('Kaç günlük mesajı silinsin (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('kullanici', true);
    const reason = i.options.getString('sebep') ?? 'Sebep belirtilmedi';
    const member = await i.guild!.members.fetch(user.id).catch(() => null);
    if (member) {
      const problem = hierarchyError(i, member);
      if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });
    }
    await i.guild!.members.ban(user, { reason: `${i.user.tag}: ${reason}`, deleteMessageSeconds: (i.options.getInteger('mesaj_sil') ?? 0) * 86400 });
    await i.reply({ embeds: [ok(`**${user.tag}** yasaklandı. Sebep: ${reason}`)] });
    await sendLog(i.guild!, new EmbedBuilder().setColor(Colors.error).setTitle('🔨 Yasaklama').setDescription(`**Üye:** ${user.tag} (${user.id})\n**Yetkili:** ${i.user}\n**Sebep:** ${reason}`));
  },
};

export default command;
