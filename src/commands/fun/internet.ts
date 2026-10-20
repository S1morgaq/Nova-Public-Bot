import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';
import { getJson } from '../../utils/http';

const fail = () => ({ embeds: [err('Servise ulaşılamadı veya sonuç bulunamadı.')], ephemeral: true as const });

const command: Command = {
  category: 'Genel',
  aliases: ['net', 'web'],
  data: new SlashCommandBuilder()
    .setName('internet')
    .setDescription('İnternetten canlı bilgiler: hava, kur, kripto, wiki, meme, hayvan fotoğrafı.')
    .addSubcommand((s) => s.setName('hava').setDescription('Hava durumu.').addStringOption((o) => o.setName('sehir').setDescription('Şehir').setRequired(true).setMaxLength(60)))
    .addSubcommand((s) =>
      s
        .setName('kur')
        .setDescription('Döviz çevirici.')
        .addStringOption((o) => o.setName('kaynak').setDescription('Örn: USD').setRequired(true).setMaxLength(3))
        .addStringOption((o) => o.setName('hedef').setDescription('Örn: TRY').setRequired(true).setMaxLength(3))
        .addNumberOption((o) => o.setName('miktar').setDescription('Miktar (varsayılan 1)').setMinValue(0)),
    )
    .addSubcommand((s) => s.setName('kripto').setDescription('Kripto para fiyatı.').addStringOption((o) => o.setName('coin').setDescription('Örn: bitcoin, ethereum, solana').setRequired(true).setMaxLength(40)))
    .addSubcommand((s) => s.setName('wiki').setDescription('Vikipedi\'de ara.').addStringOption((o) => o.setName('konu').setDescription('Konu').setRequired(true).setMaxLength(100)))
    .addSubcommand((s) => s.setName('meme').setDescription('Rastgele meme.'))
    .addSubcommand((s) =>
      s.setName('hayvan').setDescription('Rastgele hayvan fotoğrafı.').addStringOption((o) => o.setName('tur').setDescription('Tür').setRequired(true).addChoices({ name: 'Kedi', value: 'kedi' }, { name: 'Köpek', value: 'kopek' })),
    ),
  async execute(i) {
    const sub = i.options.getSubcommand();
    await i.reply({ embeds: [new EmbedBuilder().setColor(Colors.dark).setDescription('⏳ Yükleniyor...')] });
    const done = (e: EmbedBuilder) => i.editReply({ embeds: [e] });
    const bad = () => i.editReply(fail());

    switch (sub) {
      case 'hava': {
        const city = i.options.getString('sehir', true);
        const d = await getJson<{ current_condition: Record<string, any>[]; nearest_area: Record<string, any>[] }>(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=tr`);
        const c = d?.current_condition?.[0];
        if (!c) return bad();
        const place = d.nearest_area?.[0]?.areaName?.[0]?.value ?? city;
        const desc = c.lang_tr?.[0]?.value ?? c.weatherDesc?.[0]?.value ?? '—';
        return done(
          new EmbedBuilder()
            .setColor(Colors.primary)
            .setTitle(`🌤️ ${place}`)
            .setDescription(`**${desc}**`)
            .addFields(
              { name: 'Sıcaklık', value: `${c.temp_C}°C (hissedilen ${c.FeelsLikeC}°C)`, inline: true },
              { name: 'Nem', value: `%${c.humidity}`, inline: true },
              { name: 'Rüzgar', value: `${c.windspeedKmph} km/s`, inline: true },
            ),
        );
      }
      case 'kur': {
        const from = i.options.getString('kaynak', true).toUpperCase();
        const to = i.options.getString('hedef', true).toUpperCase();
        const amount = i.options.getNumber('miktar') ?? 1;
        const d = await getJson<{ rates?: Record<string, number> }>(`https://open.er-api.com/v6/latest/${from}`);
        const rate = d?.rates?.[to];
        if (!rate) return bad();
        return done(new EmbedBuilder().setColor(Colors.success).setTitle('💱 Kur').setDescription(`**${amount} ${from}** = **${(amount * rate).toLocaleString('tr-TR', { maximumFractionDigits: 4 })} ${to}**\n1 ${from} = ${rate} ${to}`));
      }
      case 'kripto': {
        const coin = i.options.getString('coin', true).toLowerCase().trim();
        const d = await getJson<Record<string, Record<string, number>>>(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd,try&include_24hr_change=true`);
        const p = d?.[coin];
        if (!p) return bad();
        const ch = p.usd_24h_change ?? 0;
        return done(
          new EmbedBuilder()
            .setColor(ch >= 0 ? Colors.success : Colors.error)
            .setTitle(`🪙 ${coin}`)
            .addFields({ name: 'USD', value: `$${p.usd.toLocaleString('en-US')}`, inline: true }, { name: 'TRY', value: `₺${p.try.toLocaleString('tr-TR')}`, inline: true }, { name: '24 saat', value: `${ch >= 0 ? '📈' : '📉'} %${ch.toFixed(2)}`, inline: true }),
        );
      }
      case 'wiki': {
        const q = i.options.getString('konu', true);
        const d = await getJson<{ title: string; extract: string; content_urls?: { desktop: { page: string } }; thumbnail?: { source: string }; type: string }>(
          `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g, '_'))}`,
        );
        if (!d || d.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') return bad();
        const e = new EmbedBuilder().setColor(Colors.dark).setTitle(d.title).setDescription(d.extract.slice(0, 1500));
        if (d.content_urls) e.setURL(d.content_urls.desktop.page);
        if (d.thumbnail) e.setThumbnail(d.thumbnail.source);
        return done(e);
      }
      case 'meme': {
        const d = await getJson<{ title: string; url: string; postLink: string; ups: number; nsfw: boolean }>('https://meme-api.com/gimme');
        if (!d || d.nsfw) return bad();
        return done(new EmbedBuilder().setColor(Colors.warn).setTitle(d.title.slice(0, 250)).setURL(d.postLink).setImage(d.url).setFooter({ text: `👍 ${d.ups}` }));
      }
      default: {
        const kedi = i.options.getString('tur', true) === 'kedi';
        const url = kedi
          ? (await getJson<{ url: string }[]>('https://api.thecatapi.com/v1/images/search'))?.[0]?.url
          : (await getJson<{ message: string }>('https://dog.ceo/api/breeds/image/random'))?.message;
        if (!url) return bad();
        return done(new EmbedBuilder().setColor(Colors.primary).setTitle(kedi ? '🐱 Miyav!' : '🐶 Hav!').setImage(url));
      }
    }
  },
};

export default command;
