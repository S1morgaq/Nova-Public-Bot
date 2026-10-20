import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed } from '../../utils/embed';
import { emoji } from '../../utils/emojis';
import { sleep } from '../../utils/http';

const command: Command = {
  category: 'Eğlence',
  aliases: ['dice', 'roll'],
  data: new SlashCommandBuilder()
    .setName('zar')
    .setDescription('Animasyonlu zar at.')
    .addIntegerOption((o) => o.setName('kenar').setDescription('Zarın kenar sayısı (varsayılan 6)').setMinValue(2).setMaxValue(1000))
    .addIntegerOption((o) => o.setName('adet').setDescription('Kaç zar (varsayılan 1)').setMinValue(1).setMaxValue(10)),
  async execute(i) {
    const sides = i.options.getInteger('kenar') ?? 6;
    const count = i.options.getInteger('adet') ?? 1;
    const roll = () => Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));

    await i.reply({ embeds: [embed(Colors.primary, `${emoji('dice')} Zar atılıyor...`)] });
    for (let frame = 0; frame < 3; frame++) {
      await sleep(600);
      await i.editReply({ embeds: [embed(Colors.primary, `${emoji('dice')} **${roll().join(' • ')}**`)] });
    }
    await sleep(600);
    const result = roll();
    const total = result.reduce((a, b) => a + b, 0);
    return i.editReply({ embeds: [embed(Colors.success, `${emoji('dice')} **${result.join(' • ')}**${count > 1 ? `\nToplam: **${total}**` : ''}`, `d${sides} × ${count}`)] });
  },
};

export default command;
