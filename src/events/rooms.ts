import { ChannelType, PermissionFlagsBits, type VoiceState } from 'discord.js';
import { getGuild, rooms } from '../db';
import type { BotEvent } from '../types';

const event: BotEvent = {
  name: 'voiceStateUpdate',
  async execute(oldState: VoiceState, newState: VoiceState) {
    const client = newState.client;
    if (!client.modules.has('rooms')) return;
    const guild = newState.guild;
    const hub = getGuild(guild.id).roomHub;

    // Hub kanalına girince özel oda aç
    if (hub && newState.channelId === hub && newState.member && !newState.member.user.bot) {
      const owner = newState.member;
      const channel = await guild.channels
        .create({
          name: `🔊 ${owner.displayName}`.slice(0, 90),
          type: ChannelType.GuildVoice,
          parent: newState.channel?.parentId ?? undefined,
          permissionOverwrites: [{ id: owner.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.Connect] }],
        })
        .catch(() => null);
      if (channel) {
        rooms.set(channel.id, owner.id);
        const moved = await owner.voice.setChannel(channel).then(() => true).catch(() => false);
        if (!moved) {
          rooms.delete(channel.id);
          await channel.delete().catch(() => null);
        }
      }
    }

    // Boşalan özel odayı sil
    const left = oldState.channel;
    if (left && rooms.get(left.id) && left.members.size === 0) {
      rooms.delete(left.id);
      await left.delete('Özel oda boşaldı').catch(() => null);
    }
  },
};

export default event;
