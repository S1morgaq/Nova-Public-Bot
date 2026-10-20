import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, type Role, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['verify'],
  data: new SlashCommandBuilder()
    .setName('dogrulama')
    .setDescription('Butona tıklayan üyeye rol veren doğrulama paneli gönderir.')
    .addChannelOption((o) => o.setName('kanal').setDescription('Panel kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addRoleOption((o) => o.setName('rol').setDescription('Doğrulanınca verilecek rol').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const channel = i.options.getChannel('kanal', true, [ChannelType.GuildText]) as TextChannel;
    const role = i.options.getRole('rol', true) as Role;
    if (role.managed || role.id === i.guildId || role.position >= i.guild!.members.me!.roles.highest.position) return i.reply({ embeds: [err('Bu rolü veremem (benim rolümden yüksek veya geçersiz).')], ephemeral: true });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`verify:${role.id}`).setLabel('Doğrulan').setEmoji('✅').setStyle(ButtonStyle.Success));
    await channel.send({ embeds: [new EmbedBuilder().setColor(Colors.success).setTitle('✅ Doğrulama').setDescription('Sunucuya erişmek için aşağıdaki butona tıkla.')], components: [row] });
    return i.reply({ embeds: [ok(`Doğrulama paneli ${channel} kanalına gönderildi.`)], ephemeral: true });
  },
};

export default command;
