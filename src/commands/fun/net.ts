import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder, type Message } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed, err, info } from '../../utils/embed';
import { getJson } from '../../utils/http';

/* eslint-disable @typescript-eslint/no-explicit-any */
const fail = (text = 'Servise ulaşılamadı veya sonuç bulunamadı.') => ({ embeds: [err(text)], ephemeral: true as const });
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'it', 'ru', 'ar', 'ja', 'az', 'pt', 'nl'];

const ceviri: Command = {
  category: 'Genel',
  aliases: ['translate', 'cevir'],
  data: new SlashCommandBuilder()
    .setName('ceviri')
    .setDescription('Metni hedef dile çevirir (kaynak dil otomatik).')
    .addStringOption((o) => o.setName('dil').setDescription('Hedef dil').setRequired(true).addChoices(...LANGS.map((l) => ({ name: l, value: l }))))
    .addStringOption((o) => o.setName('metin').setDescription('Çevrilecek metin').setRequired(true).setMaxLength(450)),
  async execute(i) {
    await i.deferReply();
    const to = i.options.getString('dil', true);
    const text = i.options.getString('metin', true);
    const d = await getJson<any>(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${to}`);
    const out = d?.responseData?.translatedText;
    if (!out || d.responseStatus !== 200) return i.editReply(fail());
    return i.editReply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(`🌐 → ${to}`).addFields({ name: 'Orijinal', value: cut(text, 1000) }, { name: 'Çeviri', value: cut(out, 1000) })] });
  },
};

const tdk: Command = {
  category: 'Genel',
  aliases: ['sozluk', 'anlam'],
  data: new SlashCommandBuilder().setName('tdk').setDescription('TDK Türkçe sözlükte kelime anlamı arar.').addStringOption((o) => o.setName('kelime').setDescription('Kelime').setRequired(true).setMaxLength(50)),
  async execute(i) {
    await i.deferReply();
    const word = i.options.getString('kelime', true);
    const d = await getJson<any>(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`);
    const entry = Array.isArray(d) ? d[0] : null;
    if (!entry) return i.editReply(fail('Kelime bulunamadı.'));
    const meanings = (entry.anlamlarListe ?? []).slice(0, 5).map((a: any, n: number) => `**${n + 1}.** ${a.anlam}`);
    return i.editReply({ embeds: [new EmbedBuilder().setColor(0xe11d48).setTitle(entry.madde).setDescription(cut(meanings.join('\n'), 1800)).setFooter({ text: `TDK${entry.lisan ? ' • ' + entry.lisan : ''}` })] });
  },
};

const namaz: Command = {
  category: 'Genel',
  aliases: ['ezan', 'vakit'],
  data: new SlashCommandBuilder().setName('namaz').setDescription('Türkiye\'deki bir şehir için bugünkü namaz vakitleri.').addStringOption((o) => o.setName('sehir').setDescription('Şehir').setRequired(true).setMaxLength(40)),
  async execute(i) {
    await i.deferReply();
    const city = i.options.getString('sehir', true);
    const d = await getJson<any>(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Turkey&method=13`);
    const t = d?.data?.timings;
    if (!t) return i.editReply(fail('Şehir bulunamadı.'));
    const rows = [['İmsak', t.Fajr], ['Güneş', t.Sunrise], ['Öğle', t.Dhuhr], ['İkindi', t.Asr], ['Akşam', t.Maghrib], ['Yatsı', t.Isha]];
    return i.editReply({ embeds: [new EmbedBuilder().setColor(0x16a34a).setTitle(`🕌 ${city} • ${d.data.date?.readable ?? 'Bugün'}`).setDescription(rows.map(([n, v]) => `**${n}:** \`${v}\``).join('\n')).setFooter({ text: 'Diyanet hesaplama yöntemi' })] });
  },
};

const deprem: Command = {
  category: 'Genel',
  aliases: ['earthquake'],
  data: new SlashCommandBuilder().setName('deprem').setDescription('Kandilli Rasathanesi\'nden son depremler.'),
  async execute(i) {
    await i.deferReply();
    const d = await getJson<any>('https://api.orhanaydogdu.com.tr/deprem/kandilli/live?limit=8');
    const list = d?.result;
    if (!Array.isArray(list) || !list.length) return i.editReply(fail('Deprem verisi alınamadı.'));
    const lines = list.slice(0, 8).map((q: any) => `**${Number(q.mag).toFixed(1)}** • ${cut(String(q.title), 40)} • ${q.depth} km • ${String(q.date).slice(5, 16)}`);
    return i.editReply({ embeds: [info(lines.join('\n'), '🌋 Son Depremler')] });
  },
};

const github: Command = {
  category: 'Genel',
  aliases: ['gh'],
  data: new SlashCommandBuilder().setName('github').setDescription('GitHub kullanıcı bilgisi.').addStringOption((o) => o.setName('kullanici').setDescription('Kullanıcı adı').setRequired(true).setMaxLength(39)),
  async execute(i) {
    await i.deferReply();
    const d = await getJson<any>(`https://api.github.com/users/${encodeURIComponent(i.options.getString('kullanici', true))}`);
    if (!d?.login) return i.editReply(fail('Kullanıcı bulunamadı.'));
    return i.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x24292f)
          .setTitle(d.name ? `${d.name} (@${d.login})` : d.login)
          .setURL(d.html_url)
          .setThumbnail(d.avatar_url)
          .setDescription(d.bio ?? null)
          .addFields({ name: 'Repo', value: String(d.public_repos), inline: true }, { name: 'Takipçi', value: String(d.followers), inline: true }, { name: 'Takip', value: String(d.following), inline: true }, { name: 'Katılma', value: `<t:${Math.floor(Date.parse(d.created_at) / 1000)}:D>`, inline: true }),
      ],
    });
  },
};

const minecraft: Command = {
  category: 'Genel',
  aliases: ['mc'],
  data: new SlashCommandBuilder().setName('minecraft').setDescription('Minecraft sunucusunun durumunu gösterir.').addStringOption((o) => o.setName('adres').setDescription('Sunucu adresi, örn. play.hypixel.net').setRequired(true).setMaxLength(100)),
  async execute(i) {
    await i.deferReply();
    const host = i.options.getString('adres', true).trim();
    const d = await getJson<any>(`https://api.mcsrvstat.us/3/${encodeURIComponent(host)}`);
    if (!d) return i.editReply(fail());
    const e = new EmbedBuilder().setColor(d.online ? Colors.success : Colors.error).setTitle(`⛏️ ${host}`).setThumbnail(`https://api.mcsrvstat.us/icon/${encodeURIComponent(host)}`);
    if (d.online) e.setDescription(cut((d.motd?.clean ?? []).join('\n') || '—', 300)).addFields({ name: 'Oyuncu', value: `${d.players?.online ?? 0}/${d.players?.max ?? 0}`, inline: true }, { name: 'Sürüm', value: d.version ?? '—', inline: true });
    else e.setDescription('🔴 Çevrimdışı');
    return i.editReply({ embeds: [e] });
  },
};

const anime: Command = {
  category: 'Genel',
  data: new SlashCommandBuilder().setName('anime').setDescription('Anime ara (MyAnimeList verisi).').addStringOption((o) => o.setName('ad').setDescription('Anime adı').setRequired(true).setMaxLength(80)),
  async execute(i) {
    await i.deferReply();
    const d = await getJson<any>(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(i.options.getString('ad', true))}&limit=1&sfw=true`);
    const a = d?.data?.[0];
    if (!a) return i.editReply(fail('Anime bulunamadı.'));
    return i.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2e51a2)
          .setTitle(a.title)
          .setURL(a.url)
          .setThumbnail(a.images?.jpg?.image_url ?? null)
          .setDescription(cut(a.synopsis ?? '—', 700))
          .addFields({ name: 'Puan', value: `⭐ ${a.score ?? '—'}`, inline: true }, { name: 'Bölüm', value: String(a.episodes ?? '?'), inline: true }, { name: 'Durum', value: a.status ?? '—', inline: true }, { name: 'Türler', value: (a.genres ?? []).map((g: any) => g.name).join(', ') || '—' }),
      ],
    });
  },
};

const trivia: Command = {
  category: 'Eğlence',
  aliases: ['quiz'],
  data: new SlashCommandBuilder().setName('trivia').setDescription('Rastgele bilgi yarışması sorusu (İngilizce, 4 şık).'),
  async execute(i) {
    const d = await getJson<any>('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986');
    const q = d?.results?.[0];
    if (!q) return i.reply(fail());
    const dec = (s: string) => decodeURIComponent(s);
    const answer = dec(q.correct_answer);
    const options = [...q.incorrect_answers.map(dec), answer].sort(() => Math.random() - 0.5);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(options.map((o, n) => new ButtonBuilder().setCustomId(`tv:${n}`).setLabel(cut(o, 80)).setStyle(ButtonStyle.Secondary)));
    const msg = (await i.reply({ embeds: [embed(Colors.primary, `**${dec(q.question)}**\n\n_${dec(q.category)} • ${dec(q.difficulty)}_\n⏱️ 20 saniyen var`, '🧠 Trivia')], components: [row], fetchReply: true })) as Message;
    const click = await msg.awaitMessageComponent({ componentType: ComponentType.Button, time: 20_000, filter: (b) => b.user.id === i.user.id }).catch(() => null);
    if (!click) return msg.edit({ embeds: [embed(Colors.warn, `⌛ Süre doldu. Doğru cevap: **${answer}**`)], components: [] }).catch(() => null);
    const right = options[Number(click.customId.slice(3))] === answer;
    return click.update({ embeds: [embed(right ? Colors.success : Colors.error, right ? `✅ Doğru! **${answer}**` : `❌ Yanlış. Doğru cevap: **${answer}**`)], components: [] });
  },
};

export default [ceviri, tdk, namaz, deprem, github, minecraft, anime, trivia];
