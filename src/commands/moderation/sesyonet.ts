import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type GuildMember, type VoiceBasedChannel } from 'discord.js';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const voiceOpt = (name: string, desc: string) => (o: import('discord.js').SlashCommandChannelOption) =>
  o.setName(name).setDescription(desc).addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice).setRequired(true);
const memberOpt = (o: import('discord.js').SlashCommandUserOption) => o.setName('uye').setDescription('Üye').setRequired(true);

const command: Command = {
  category: 'Moderasyon',
  aliases: ['voiceman', 'ses'],
  data: new SlashCommandBuilder()
    .setName('sesyonet')
    .setDescription('Ses kanalı yönetimi: taşı, at, sustur, toplu taşı, boşalt, listele.')
    .addSubcommand((s) => s.setName('tasi').setDescription('Üyeyi başka bir ses kanalına taşır.').addUserOption(memberOpt).addChannelOption(voiceOpt('kanal', 'Hedef ses kanalı')))
    .addSubcommand((s) => s.setName('at').setDescription('Üyeyi ses kanalından çıkarır.').addUserOption(memberOpt))
    .addSubcommand((s) => s.setName('sustur').setDescription('Üyeyi seste susturur/açar.').addUserOption(memberOpt).addBooleanOption((o) => o.setName('durum').setDescription('Susturulsun mu?').setRequired(true)))
    .addSubcommand((s) => s.setName('sagirlastir').setDescription('Üyeyi seste sağırlaştırır/açar.').addUserOption(memberOpt).addBooleanOption((o) => o.setName('durum').setDescription('Sağırlaştırılsın mı?').setRequired(true)))
    .addSubcommand((s) => s.setName('herkesitasi').setDescription('Bulunduğun kanaldakilerin hepsini başka kanala taşır.').addChannelOption(voiceOpt('kanal', 'Hedef ses kanalı')))
    .addSubcommand((s) => s.setName('bosalt').setDescription('Bir ses kanalındaki herkesi çıkarır.').addChannelOption(voiceOpt('kanal', 'Boşaltılacak kanal')))
    .addSubcommand((s) => s.setName('liste').setDescription('Seste kimler var, listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false),
  async execute(i) {
    const guild = i.guild!;
    const sub = i.options.getSubcommand();
    const reason = `${i.user.tag}: sesyonet ${sub}`;

    if (sub === 'liste') {
      const lines = guild.channels.cache
        .filter((c): c is VoiceBasedChannel => c.isVoiceBased() && c.members.size > 0)
        .map((c) => `**${c.name}** (${c.members.size})\n${c.members.map((m) => m.displayName).slice(0, 15).join(', ')}`);
      return i.reply({ embeds: [info(lines.join('\n\n') || 'Seste kimse yok.', '🔊 Seste Olanlar')] });
    }

    if (sub === 'herkesitasi' || sub === 'bosalt') {
      const target = guild.channels.cache.get(i.options.getChannel('kanal', true).id) as VoiceBasedChannel;
      const from = sub === 'bosalt' ? target : ((i.member as GuildMember).voice.channel as VoiceBasedChannel | null);
      if (!from) return i.reply({ embeds: [err('Önce bir ses kanalında olmalısın.')], ephemeral: true });
      let n = 0;
      for (const m of [...from.members.values()]) {
        if (await (sub === 'bosalt' ? m.voice.disconnect(reason) : m.voice.setChannel(target, reason)).then(() => true).catch(() => false)) n++;
      }
      return i.reply({ embeds: [ok(sub === 'bosalt' ? `${target} boşaltıldı (${n} kişi).` : `${n} kişi ${target} kanalına taşındı.`)] });
    }

    const member = await guild.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    if (!member.voice.channel) return i.reply({ embeds: [err(`${member.displayName} şu an seste değil.`)], ephemeral: true });

    switch (sub) {
      case 'tasi': {
        const target = guild.channels.cache.get(i.options.getChannel('kanal', true).id) as VoiceBasedChannel;
        await member.voice.setChannel(target, reason);
        return i.reply({ embeds: [ok(`${member} → ${target}`)], allowedMentions: { parse: [] } });
      }
      case 'at':
        await member.voice.disconnect(reason);
        return i.reply({ embeds: [ok(`${member} ses kanalından çıkarıldı.`)], allowedMentions: { parse: [] } });
      case 'sustur': {
        const on = i.options.getBoolean('durum', true);
        await member.voice.setMute(on, reason);
        return i.reply({ embeds: [ok(`${member} seste ${on ? 'susturuldu' : 'açıldı'}.`)], allowedMentions: { parse: [] } });
      }
      default: {
        const on = i.options.getBoolean('durum', true);
        await member.voice.setDeaf(on, reason);
        return i.reply({ embeds: [ok(`${member} ${on ? 'sağırlaştırıldı' : 'sağırlığı kaldırıldı'}.`)], allowedMentions: { parse: [] } });
      }
    }
  },
};

export default command;
