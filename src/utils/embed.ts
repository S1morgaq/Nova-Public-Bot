import { EmbedBuilder, MessageFlags } from 'discord.js';

export const Colors = { primary: 0x5865f2, success: 0x57f287, error: 0xed4245, warn: 0xfee75c, dark: 0x2b2d31 };
export const EPH = MessageFlags.Ephemeral;

export const embed = (color: number, description: string, title?: string) => {
  const e = new EmbedBuilder().setColor(color).setDescription(description);
  if (title) e.setTitle(title);
  return e;
};

export const ok = (text: string) => embed(Colors.success, `✅ ${text}`);
export const err = (text: string) => embed(Colors.error, `❌ ${text}`);
export const info = (text: string, title?: string) => embed(Colors.primary, text, title);

export function formatDuration(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h && `${h} sa`, m && `${m} dk`, !h && `${sec} sn`].filter(Boolean).join(' ');
}
