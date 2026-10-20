import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { Colors, ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['announce'],
  data: new SlashCommandBuilder()
    .setName('duyuru')
    .setDescription('Seçilen kanala şık bir duyuru embed\'i gönderir.')
    .addChannelOption((o) => o.setName('kanal').setDescription('Kanal').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .addStringOption((o) => o.setName('baslik').setDescription('Başlık').setRequired(true).setMaxLength(100))
    .addStringOption((o) => o.setName('mesaj').setDescription('Duyuru metni (satır başı için \\n yaz)').setRequired(true).setMaxLength(2000))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(i) {
    const channel = i.options.getChannel('kanal', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]) as TextChannel;
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(`📢 ${i.options.getString('baslik', true)}`)
      .setDescription(i.options.getString('mesaj', true).replaceAll('\\n', '\n'))
      .setFooter({ text: i.user.username, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
    await channel.send({ embeds: [e] });
    return i.reply({ embeds: [ok(`Duyuru ${channel} kanalına gönderildi.`)], ephemeral: true });
  },
};

export default command;
