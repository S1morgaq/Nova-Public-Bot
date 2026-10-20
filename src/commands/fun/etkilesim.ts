import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';
import { getJson } from '../../utils/http';

/** nekos.best API'si: gerçek hareketli GIF'ler. [endpoint → fiil] */
export const ACTIONS: Record<string, string> = {
  hug: 'sarıldı',
  pat: 'başını okşadı',
  slap: 'tokat attı',
  kiss: 'öptü',
  cuddle: 'sarmaladı',
  poke: 'dürttü',
  dance: 'ile dans etti',
  cry: 'yüzünden ağladı',
  laugh: 'ile güldü',
  wave: 'el salladı',
  bite: 'ısırdı',
  blush: 'karşısında kızardı',
  smile: 'a gülümsedi',
  wink: 'göz kırptı',
  punch: 'yumruk attı',
  kick: 'tekme attı',
  tickle: 'gıdıkladı',
  facepalm: 'yüzünden elini yüzüne kapadı',
  shrug: 'omuz silkti',
  bored: 'ile sıkıldı',
  think: 'hakkında düşündü',
  pout: 'a surat astı',
  yeet: 'fırlattı',
  handhold: 'ile el ele tutuştu',
};

export async function sendAction(i: ChatInputCommandInteraction, tur: string) {
  const target = i.options.getUser('uye');
  const data = await getJson<{ results: { url: string; anime_name?: string }[] }>(`https://nekos.best/api/v2/${tur}`);
  const gif = data?.results?.[0];
  if (!gif) return i.reply({ embeds: [err('GIF servisine ulaşılamadı, biraz sonra tekrar dene.')], ephemeral: true });

  const text = target ? `**${i.user.username}**, **${target.username}** ${ACTIONS[tur]}!` : `**${i.user.username}** ${tur} yaptı!`;
  const e = new EmbedBuilder().setColor(Colors.primary).setDescription(text).setImage(gif.url);
  if (gif.anime_name) e.setFooter({ text: gif.anime_name });
  return i.reply({ embeds: [e], allowedMentions: { parse: [] } });
}

const command: Command = {
  category: 'Eğlence',
  aliases: ['gif', 'act'],
  data: new SlashCommandBuilder()
    .setName('etkilesim')
    .setDescription('Hareketli GIF ile etkileşim: sarıl, tokat at, dans et...')
    .addStringOption((o) =>
      o
        .setName('tur')
        .setDescription('Ne yapacaksın?')
        .setRequired(true)
        .addChoices(...Object.keys(ACTIONS).map((k) => ({ name: k, value: k }))),
    )
    .addUserOption((o) => o.setName('uye').setDescription('Kime?'))
    .setDMPermission(false),
  async execute(i) {
    return sendAction(i, i.options.getString('tur', true));
  },
};

export default command;
