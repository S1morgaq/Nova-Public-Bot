import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors } from '../../utils/embed';

const command: Command = {
  category: 'Genel',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Bir üyenin avatarını gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye')),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const url = user.displayAvatarURL({ size: 1024 });
    return i.reply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(user.tag).setURL(url).setImage(url)] });
  },
};

export default command;
