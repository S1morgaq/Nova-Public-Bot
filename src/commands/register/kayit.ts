import { EmbedBuilder, SlashCommandBuilder, type GuildMember } from 'discord.js';
import { getGuild, getUser, touch } from '../../db';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';
import { sendLog } from '../../utils/log';

const command: Command = {
  category: 'Araçlar',
  aliases: ['kayıt', 'register', 'k'],
  data: new SlashCommandBuilder()
    .setName('kayit')
    .setDescription('Yeni üyeyi kayıt eder (isim | yaş verir, üye rolü verir, kayıtsız rolü alır).')
    .addUserOption((o) => o.setName('uye').setDescription('Kayıt edilecek üye').setRequired(true))
    .addStringOption((o) => o.setName('isim').setDescription('İsim').setRequired(true).setMaxLength(24))
    .addIntegerOption((o) => o.setName('yas').setDescription('Yaş').setMinValue(5).setMaxValue(99))
    .setDMPermission(false),
  async execute(i) {
    const s = getGuild(i.guildId!);
    const mod = i.member as GuildMember;
    if (!s.registerMemberRole) return i.reply({ embeds: [err('Kayıt sistemi kurulu değil. `/ayarla kayit` ile kur.')], ephemeral: true });
    const isStaff = (s.registerStaffRole && mod.roles.cache.has(s.registerStaffRole)) || mod.permissions.has('ManageRoles');
    if (!isStaff) return i.reply({ embeds: [err('Kayıt yetkilisi değilsin.')], ephemeral: true });

    const target = await i.guild!.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
    if (!target) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    if (target.roles.cache.has(s.registerMemberRole)) return i.reply({ embeds: [err('Bu üye zaten kayıtlı.')], ephemeral: true });

    const name = i.options.getString('isim', true);
    const age = i.options.getInteger('yas');
    const nick = age ? `${name} | ${age}` : name;
    await target.setNickname(nick, `Kayıt: ${i.user.tag}`).catch(() => null);
    await target.roles.add(s.registerMemberRole).catch(() => null);
    if (s.registerUnregRole) await target.roles.remove(s.registerUnregRole).catch(() => null);

    const stats = getUser(i.guildId!, i.user.id);
    stats.registered = (stats.registered ?? 0) + 1;
    touch();

    const e = new EmbedBuilder()
      .setColor(Colors.success)
      .setDescription(`✅ ${target} kayıt edildi.\n**İsim:** ${nick}\n**Yetkili:** ${i.user} (${stats.registered}. kayıt)`);
    await i.reply({ embeds: [e], allowedMentions: { parse: [] } });
    await sendLog(i.guild!, new EmbedBuilder(e.data).setTitle('📝 Kayıt'));
  },
};

export default command;
