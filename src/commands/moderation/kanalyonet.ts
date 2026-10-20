import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type CategoryChannel, type GuildChannel, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const chanOpt = (o: import('discord.js').SlashCommandChannelOption) => o.setName('kanal').setDescription('Kanal').setRequired(true);

const command: Command = {
  category: 'Moderasyon',
  aliases: ['channelman', 'kanalyonetim'],
  data: new SlashCommandBuilder()
    .setName('kanalyonet')
    .setDescription('Gelişmiş kanal yönetimi: oluştur, sil, taşı, klonla, gizle, sabitle...')
    .addSubcommand((s) =>
      s
        .setName('olustur')
        .setDescription('Yeni kanal oluşturur.')
        .addStringOption((o) => o.setName('tur').setDescription('Tür').setRequired(true).addChoices({ name: 'Yazı', value: 'yazi' }, { name: 'Ses', value: 'ses' }, { name: 'Kategori', value: 'kategori' }))
        .addStringOption((o) => o.setName('ad').setDescription('Kanal adı').setRequired(true).setMaxLength(100)),
    )
    .addSubcommand((s) => s.setName('sil').setDescription('Kanalı siler.').addChannelOption(chanOpt).addBooleanOption((o) => o.setName('onay').setDescription('Evet = onaylıyorum').setRequired(true)))
    .addSubcommand((s) => s.setName('isim').setDescription('Kanal adını değiştirir.').addChannelOption(chanOpt).addStringOption((o) => o.setName('ad').setDescription('Yeni ad').setRequired(true).setMaxLength(100)))
    .addSubcommand((s) =>
      s.setName('konu').setDescription('Yazı kanalının konusunu ayarlar.').addChannelOption((o) => o.setName('kanal').setDescription('Yazı kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)).addStringOption((o) => o.setName('konu').setDescription('Konu').setRequired(true).setMaxLength(1000)),
    )
    .addSubcommand((s) =>
      s.setName('tasi').setDescription('Kanalı bir kategoriye taşır.').addChannelOption(chanOpt).addChannelOption((o) => o.setName('kategori').setDescription('Hedef kategori').addChannelTypes(ChannelType.GuildCategory).setRequired(true)),
    )
    .addSubcommand((s) => s.setName('klonla').setDescription('Kanalı izinleriyle klonlar.').addChannelOption(chanOpt))
    .addSubcommand((s) => s.setName('gizle').setDescription('Kanalı herkesten gizler.').addChannelOption(chanOpt))
    .addSubcommand((s) => s.setName('goster').setDescription('Gizli kanalı herkese gösterir.').addChannelOption(chanOpt))
    .addSubcommand((s) => s.setName('nsfw').setDescription('Yaş sınırını aç/kapat.').addChannelOption((o) => o.setName('kanal').setDescription('Yazı kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)).addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true)))
    .addSubcommand((s) => s.setName('sabitle').setDescription('Bu kanaldaki bir mesajı sabitler.').addStringOption((o) => o.setName('mesaj_id').setDescription('Mesaj ID').setRequired(true).setMaxLength(20)))
    .addSubcommand((s) => s.setName('sabitkaldir').setDescription('Bu kanaldaki sabit mesajı kaldırır.').addStringOption((o) => o.setName('mesaj_id').setDescription('Mesaj ID').setRequired(true).setMaxLength(20)))
    .addSubcommand((s) => s.setName('ilkmesaj').setDescription('Bu kanalın ilk mesajının bağlantısını verir.'))
    .addSubcommand((s) => s.setName('liste').setDescription('Kategorilere göre kanalları listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(i) {
    const guild = i.guild!;
    const sub = i.options.getSubcommand();
    const reason = `${i.user.tag}: kanalyonet ${sub}`;

    if (sub === 'olustur') {
      const tur = i.options.getString('tur', true);
      const type = tur === 'ses' ? ChannelType.GuildVoice : tur === 'kategori' ? ChannelType.GuildCategory : ChannelType.GuildText;
      const ch = await guild.channels.create({ name: i.options.getString('ad', true), type, reason });
      return i.reply({ embeds: [ok(`Oluşturuldu: ${ch}`)] });
    }
    if (sub === 'liste') {
      const cats = guild.channels.cache.filter((c): c is CategoryChannel => c.type === ChannelType.GuildCategory).sort((a, b) => a.position - b.position);
      const lines = [...cats.values()].map((c) => `**${c.name}**\n${c.children.cache.map((x) => `• ${x.name}`).slice(0, 12).join('\n') || '—'}`);
      const loose = guild.channels.cache.filter((c) => !c.parentId && c.type !== ChannelType.GuildCategory && !c.isThread()).map((c) => `• ${c.name}`);
      if (loose.length) lines.push(`**(kategorisiz)**\n${loose.slice(0, 12).join('\n')}`);
      return i.reply({ embeds: [info(lines.join('\n\n').slice(0, 4000) || 'Kanal yok.', `Kanallar (${guild.channels.cache.size})`)] });
    }
    if (sub === 'sabitle' || sub === 'sabitkaldir') {
      const msg = await (i.channel as TextChannel).messages.fetch(i.options.getString('mesaj_id', true).trim()).catch(() => null);
      if (!msg) return i.reply({ embeds: [err('Bu kanalda böyle bir mesaj yok.')], ephemeral: true });
      await (sub === 'sabitle' ? msg.pin(reason) : msg.unpin(reason));
      return i.reply({ embeds: [ok(sub === 'sabitle' ? 'Mesaj sabitlendi.' : 'Sabit kaldırıldı.')] });
    }
    if (sub === 'ilkmesaj') {
      const first = (await (i.channel as TextChannel).messages.fetch({ after: '0', limit: 1 }).catch(() => null))?.first();
      return i.reply({ embeds: [first ? info(`[İlk mesaja git](${first.url})\n**${first.author.tag}:** ${first.content.slice(0, 200) || '(içerik yok)'}`, '📌 İlk Mesaj') : err('İlk mesaj bulunamadı.')] });
    }

    const picked = guild.channels.cache.get(i.options.getChannel('kanal', true).id) as GuildChannel | undefined;
    if (!picked) return i.reply({ embeds: [err('Kanal bulunamadı.')], ephemeral: true });

    switch (sub) {
      case 'sil': {
        if (!i.options.getBoolean('onay', true)) return i.reply({ embeds: [err('İşlem iptal edildi.')], ephemeral: true });
        const name = picked.name;
        const here = picked.id === i.channelId;
        await picked.delete(reason);
        return here ? undefined : i.reply({ embeds: [ok(`**${name}** silindi.`)] });
      }
      case 'isim': {
        await picked.setName(i.options.getString('ad', true), reason);
        return i.reply({ embeds: [ok(`Kanal adı güncellendi: ${picked}`)] });
      }
      case 'konu': {
        await (picked as TextChannel).setTopic(i.options.getString('konu', true), reason);
        return i.reply({ embeds: [ok(`${picked} konusu güncellendi.`)] });
      }
      case 'tasi': {
        await picked.setParent(i.options.getChannel('kategori', true).id, { lockPermissions: false, reason });
        return i.reply({ embeds: [ok(`${picked} taşındı.`)] });
      }
      case 'klonla': {
        const copy = await picked.clone({ reason });
        return i.reply({ embeds: [ok(`Klonlandı: ${copy}`)] });
      }
      case 'gizle':
      case 'goster': {
        await picked.permissionOverwrites.edit(guild.id, { ViewChannel: sub === 'gizle' ? false : null }, { reason });
        return i.reply({ embeds: [ok(sub === 'gizle' ? `${picked} herkesten gizlendi.` : `${picked} herkese gösteriliyor.`)] });
      }
      default: {
        const on = i.options.getBoolean('durum', true);
        await (picked as TextChannel).setNSFW(on, reason);
        return i.reply({ embeds: [ok(`${picked} yaş sınırı ${on ? 'açıldı' : 'kapatıldı'}.`)] });
      }
    }
  },
};

export default command;
