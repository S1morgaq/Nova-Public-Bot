import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, type Role, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['reactionrole', 'rr'],
  data: new SlashCommandBuilder()
    .setName('butonrol')
    .setDescription('Üyelerin tek tıkla rol alıp bırakabildiği buton paneli gönderir.')
    .addStringOption((o) => o.setName('baslik').setDescription('Panel başlığı').setRequired(true).setMaxLength(100))
    .addRoleOption((o) => o.setName('rol1').setDescription('1. rol').setRequired(true))
    .addRoleOption((o) => o.setName('rol2').setDescription('2. rol'))
    .addRoleOption((o) => o.setName('rol3').setDescription('3. rol'))
    .addRoleOption((o) => o.setName('rol4').setDescription('4. rol'))
    .addRoleOption((o) => o.setName('rol5').setDescription('5. rol'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),
  async execute(i) {
    const roles = ['rol1', 'rol2', 'rol3', 'rol4', 'rol5'].map((n) => i.options.getRole(n)).filter((r): r is Role => !!r && 'position' in r);
    const botTop = i.guild!.members.me!.roles.highest.position;
    const bad = roles.find((r) => r.managed || r.id === i.guildId || r.position >= botTop);
    if (bad) return i.reply({ embeds: [err(`**${bad.name}** rolünü veremem (benim rolümden yüksek, bot rolü veya @everyone).`)], ephemeral: true });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      roles.map((r) => new ButtonBuilder().setCustomId(`rr:${r.id}`).setLabel(r.name.slice(0, 80)).setStyle(ButtonStyle.Secondary)),
    );
    const e = new EmbedBuilder().setColor(Colors.primary).setTitle(i.options.getString('baslik', true)).setDescription('Rol almak veya bırakmak için butonlara tıkla.');
    await (i.channel as TextChannel).send({ embeds: [e], components: [row] });
    return i.reply({ embeds: [ok('Rol paneli gönderildi.')], ephemeral: true });
  },
};

export default command;
