import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types';

interface Def {
  name: string;
  desc: string;
  category: Command['category'];
  aliases?: string[];
  /** Varsayılan true: slash olarak kaydedilmez, sadece prefix ile çalışır. */
  prefixOnly?: boolean;
  perms?: bigint;
  guildOnly?: boolean;
  options?: (b: SlashCommandBuilder) => unknown;
  run: (i: ChatInputCommandInteraction) => Promise<unknown>;
}

/** Komut tanımını kısaltmak için yardımcı. Çok sayıda küçük komut yazarken kullanılır. */
export function makeCommand(def: Def): Command {
  const b = new SlashCommandBuilder().setName(def.name).setDescription(def.desc).setDMPermission(!(def.guildOnly ?? true));
  if (def.perms !== undefined) b.setDefaultMemberPermissions(def.perms);
  def.options?.(b);
  return { category: def.category, aliases: def.aliases, prefixOnly: def.prefixOnly ?? true, data: b, execute: def.run };
}
