import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { pickOne, rand } from '../../utils/cooldown';
import { Colors, embed, info } from '../../utils/embed';

const COMPLIMENTS = [
  'Gülüşün sunucunun en güzel emojisi.',
  'Senin gibi biri olduğu için bu sunucu çok daha iyi.',
  'Zekâna hayranım, bot olsam bile fark ederdim.',
  'Enerjin bulaşıcı, herkes seninle neşeleniyor.',
  'Bugün harika görünüyorsun (en azından avatarın öyle).',
  'Sen olmasan bu sohbetler bu kadar eğlenceli olmazdı.',
];

const FORTUNES = [
  '☕ Yakında beklemediğin bir yerden güzel bir haber alacaksın.',
  '🌙 Bu hafta eski bir dostun seni arayacak.',
  '💰 Cüzdanın doluyor, ama harcamak da kolay olacak.',
  '🔮 Önünde yeni bir yol var, cesur ol.',
  '🍀 Şans bu aralar senden yana, bir risk al.',
  '⚠️ Bugün acele karar verme, bir gün daha düşün.',
  '❤️ Kalbinde saklı bir niyet var, çok yakında ortaya çıkacak.',
];

const QUOTES = [
  '"Hayatta en hakiki mürşit ilimdir." — Mustafa Kemal Atatürk',
  '"Yaşamak bir ağaç gibi tek ve hür, ve bir orman gibi kardeşçesine." — Nâzım Hikmet',
  '"Gelecek, bugünden başlar." — Anonim',
  '"Düşmeyen kalkmaz; kalkan da bir daha düşmez." — Mevlânâ',
  '"Bir şeyi başarmak için önce başlamak gerekir." — Anonim',
  '"Hayal gücü bilgiden daha önemlidir." — Albert Einstein',
];

const TRUTHS = [
  'En son ne zaman yalan söyledin ve neden?',
  'Telefonundaki en utandırıcı uygulama hangisi?',
  'Bu sunucuda en çok kimle konuşuyorsun?',
  'Çocukken yaptığın en büyük yaramazlık neydi?',
  'Hiç kimseye söylemediğin bir sır var mı? (detay vermeden)',
];
const DARES = [
  'Sunucuda 5 dakika boyunca sadece emojiyle konuş.',
  'Son attığın mesajı tersten yaz.',
  'Profil fotoğrafını 10 dakika boyunca bir meme yap.',
  'Sohbete en komik espriyi at.',
  'Yan odadaki birine "Bugün çok güzel görünüyorsun" de ve tepkisini anlat.',
];

const iltifat: Command = {
  category: 'Eğlence',
  aliases: ['compliment'],
  data: new SlashCommandBuilder().setName('iltifat').setDescription('Birine iltifat et.').addUserOption((o) => o.setName('uye').setDescription('Kime?')),
  async execute(i) {
    const target = i.options.getUser('uye') ?? i.user;
    return i.reply({ embeds: [embed(Colors.success, `${target}, ${pickOne(COMPLIMENTS)}`, '💖 İltifat')], allowedMentions: { users: [target.id] } });
  },
};

const fal: Command = {
  category: 'Eğlence',
  data: new SlashCommandBuilder().setName('fal').setDescription('Kahve falına bak (eğlence amaçlı).'),
  async execute(i) {
    return i.reply({ embeds: [info(pickOne(FORTUNES), '🔮 Falın')] });
  },
};

const soz: Command = {
  category: 'Eğlence',
  aliases: ['quote'],
  data: new SlashCommandBuilder().setName('soz').setDescription('Rastgele güzel söz.'),
  async execute(i) {
    return i.reply({ embeds: [info(pickOne(QUOTES), '📜 Günün Sözü')] });
  },
};

const dogruluk: Command = {
  category: 'Eğlence',
  aliases: ['truth', 'dare'],
  data: new SlashCommandBuilder()
    .setName('dogruluk')
    .setDescription('Doğruluk mu cesaret mi?')
    .addStringOption((o) => o.setName('tur').setDescription('Seçimin').setRequired(true).addChoices({ name: 'Doğruluk', value: 'dogruluk' }, { name: 'Cesaret', value: 'cesaret' })),
  async execute(i) {
    const truth = i.options.getString('tur', true) === 'dogruluk';
    return i.reply({ embeds: [info(pickOne(truth ? TRUTHS : DARES), truth ? '🫣 Doğruluk' : '😈 Cesaret')] });
  },
};

const yuzde: Command = {
  category: 'Eğlence',
  aliases: ['percent'],
  data: new SlashCommandBuilder()
    .setName('yuzde')
    .setDescription('Birinin bir özelliğinin yüzdesini ölçer. Örn: yuzde @kisi zeki')
    .addUserOption((o) => o.setName('uye').setDescription('Kim?').setRequired(true))
    .addStringOption((o) => o.setName('ozellik').setDescription('Ne kadar...?').setRequired(true).setMaxLength(40)),
  async execute(i) {
    const target = i.options.getUser('uye', true);
    const trait = i.options.getString('ozellik', true);
    const p = rand(0, 100);
    const bar = '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
    return i.reply({ embeds: [info(`${target} **%${p}** ${trait}\n\`${bar}\``, '📊 Ölçüm')], allowedMentions: { parse: [] } });
  },
};

export default [iltifat, fal, soz, dogruluk, yuzde];
