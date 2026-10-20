import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild } from '../../db';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';
import { jailMember } from '../../utils/jail';
import { sendLog } from '../../utils/log';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Ceza',
  aliases: ['cezali', 'karantina'],
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('Üyeyi cezalıya atar (rolleri alınır, süre bitince geri verilir).')
    .addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true))
    .addIntegerOption((o) => o.setName('dakika').setDescription('Süre (dakika, 0 = süresiz)').setMinValue(0).setMaxValue(525600).setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const s = getGuild(i.guildId!);
    if (!s.jailRole) return i.reply({ embeds: [err('Jail rolü ayarlı değil. `/ayarla jail` ile ayarla.')], ephemeral: true });
    if (i.guild!.roles.cache.get(s.jailRole)!.position >= i.guild!.members.me!.roles.highest.position) return i.reply({ embeds: [err('Jail rolü benim rolümden yüksek.')], ephemeral: true });

    const member = await i.guild!.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const problem = hierarchyError(i, member);
    if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });

    const minutes = i.options.getInteger('dakika', true);
    const reason = i.options.getString('sebep') ?? 'Sebep belirtilmedi';
    await jailMember(member, s.jailRole, minutes, `${i.user.tag}: ${reason}`);
    const until = minutes ? `<t:${Math.floor((Date.now() + minutes * 60_000) / 1000)}:R>` : 'süresiz';
    await i.reply({ embeds: [ok(`${member} cezalıya atıldı (${until}). Sebep: ${reason}`)], allowedMentions: { parse: [] } });
    await sendLog(i.guild!, new EmbedBuilder().setColor(Colors.error).setTitle('⛓️ Jail').setDescription(`**Üye:** ${member}\n**Yetkili:** ${i.user}\n**Süre:** ${until}\n**Sebep:** ${reason}`));
  },
};

export default command;
