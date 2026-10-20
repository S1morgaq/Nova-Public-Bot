import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { embed, Colors, err } from '../../utils/embed';
import { emoji } from '../../utils/emojis';
import { sleep } from '../../utils/http';

const command: Command = {
  category: 'Eğlence',
  aliases: ['cf', 'coinflip', 'yt'],
  data: new SlashCommandBuilder()
    .setName('yazitura')
    .setDescription('Yazı tura at, istersen bahis oyna.')
    .addStringOption((o) => o.setName('secim').setDescription('Tahminin').setRequired(true).addChoices({ name: 'Yazı', value: 'yazı' }, { name: 'Tura', value: 'tura' }))
    .addIntegerOption((o) => o.setName('bahis').setDescription('Bahis miktarı').setMinValue(1))
    .setDMPermission(false),
  async execute(i) {
    const pick = i.options.getString('secim', true);
    const bet = i.options.getInteger('bahis');
    const result = Math.random() < 0.5 ? 'yazı' : 'tura';
    const won = pick === result;
    let extra = '';
    if (bet) {
      const u = getUser(i.guildId!, i.user.id);
      if (u.balance < bet) return i.reply({ embeds: [err('Yeterli bakiyen yok.')], ephemeral: true });
      u.balance += won ? bet : -bet;
      touch();
      extra = `\n${won ? '+' : '-'}${bet} ${config.currency} • Bakiye: ${u.balance}`;
    }
    await i.reply({ embeds: [embed(Colors.primary, `${emoji('coin')} Para havaya atıldı...`)] });
    await sleep(900);
    await i.editReply({ embeds: [embed(Colors.primary, `${emoji('coin')} Dönüyor... ${emoji('coin')} ... ${emoji('coin')}`)] });
    await sleep(900);
    return i.editReply({ embeds: [embed(won ? Colors.success : Colors.error, `🪙 **${result.toUpperCase()}** geldi! ${won ? 'Kazandın!' : 'Kaybettin.'}${extra}`)] });
  },
};

export default command;
