import { PermissionFlagsBits, SlashCommandBuilder, type GuildMember, type Role } from 'discord.js';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['role'],
  data: new SlashCommandBuilder()
    .setName('rol')
    .setDescription('Üyeye rol ver / al.')
    .addSubcommand((s) =>
      s.setName('ver').setDescription('Rol verir.').addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true)).addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)),
    )
    .addSubcommand((s) =>
      s.setName('al').setDescription('Rolü geri alır.').addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true)).addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),
  async execute(i) {
    const role = i.options.getRole('rol', true) as Role;
    const member = await i.guild!.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });

    const mod = i.member as GuildMember;
    if (role.managed || role.id === i.guildId) return i.reply({ embeds: [err('Bu rol verilemez/alınamaz.')], ephemeral: true });
    if (i.user.id !== i.guild!.ownerId && role.position >= mod.roles.highest.position) return i.reply({ embeds: [err('Bu rol senin en yüksek rolünden yüksek veya eşit.')], ephemeral: true });
    if (role.position >= i.guild!.members.me!.roles.highest.position) return i.reply({ embeds: [err('Bu rol benim rolümden yüksek veya eşit.')], ephemeral: true });

    const give = i.options.getSubcommand() === 'ver';
    await (give ? member.roles.add(role) : member.roles.remove(role));
    return i.reply({ embeds: [ok(`${member} ${give ? 'üyesine' : 'üyesinden'} **${role.name}** ${give ? 'verildi' : 'alındı'}.`)], allowedMentions: { parse: [] } });
  },
};

export default command;
