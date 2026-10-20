import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { addWarn, getWarns } from '../../db';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';
import { sendLog } from '../../utils/log';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['warn'],
  data: new SlashCommandBuilder()
    .setName('uyar')
    .setDescription('Bir üyeyi uyarır. 3 uyarıda otomatik 1 saat susturulur.')
    .addUserOption((o) => o.setName('kullanici').setDescription('Üye').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('kullanici', true);
    const reason = i.options.getString('sebep', true);
    const member = await i.guild!.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const problem = hierarchyError(i, member);
    if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });

    addWarn({ guildId: i.guildId!, userId: user.id, modId: i.user.id, reason });
    const total = getWarns(i.guildId!, user.id).length;
    let note = '';
    if (total % 3 === 0) {
      await member.timeout(3_600_000, `${total} uyarı (otomatik)`).catch(() => null);
      note = '\n⏱️ 3 uyarıya ulaştığı için **1 saat susturuldu**.';
    }
    await user.send(`**${i.guild!.name}** sunucusunda uyarıldın.\nSebep: ${reason}`).catch(() => null);
    await i.reply({ embeds: [ok(`**${user.tag}** uyarıldı (toplam ${total}). Sebep: ${reason}${note}`)] });
    await sendLog(i.guild!, new EmbedBuilder().setColor(Colors.warn).setTitle('⚠️ Uyarı').setDescription(`**Üye:** ${user}\n**Yetkili:** ${i.user}\n**Sebep:** ${reason}\n**Toplam:** ${total}`));
  },
};

export default command;
