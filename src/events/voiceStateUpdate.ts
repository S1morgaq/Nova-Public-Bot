import type { VoiceState } from 'discord.js';
import { getUser, touch } from '../db';
import type { BotEvent } from '../types';

const joinedAt = new Map<string, number>();

const event: BotEvent = {
  name: 'voiceStateUpdate',
  async execute(oldState: VoiceState, newState: VoiceState) {
    const member = newState.member ?? oldState.member;
    if (!newState.client.modules.has('stats') || !member || member.user.bot) return;
    const key = `${member.guild.id}:${member.id}`;

    // Ses kanalındaysa ve henüz sayılmıyorsa başlat (kanal değiştirmek süreyi sıfırlamaz)
    if (newState.channelId && !joinedAt.has(key)) joinedAt.set(key, Date.now());

    if (!newState.channelId && joinedAt.has(key)) {
      const seconds = Math.floor((Date.now() - joinedAt.get(key)!) / 1000);
      joinedAt.delete(key);
      const u = getUser(member.guild.id, member.id);
      u.voiceSeconds = (u.voiceSeconds ?? 0) + seconds;
      touch();
    }
  },
};

export default event;
