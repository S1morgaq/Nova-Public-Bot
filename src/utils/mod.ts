import type { ChatInputCommandInteraction, GuildMember, Role } from 'discord.js';

/** Rolü yönetmeye (verme/düzenleme/silme) moderatör ve bot yetkili mi? Hata varsa mesajı döner. */
export function roleError(i: ChatInputCommandInteraction, role: Role): string | null {
  if (role.managed || role.id === i.guildId) return 'Bu rol yönetilemez (bot/entegrasyon rolü ya da @everyone).';
  if (i.user.id !== i.guild!.ownerId && role.position >= (i.member as GuildMember).roles.highest.position) return 'Bu rol senin en yüksek rolünden yüksek veya eşit.';
  if (role.position >= i.guild!.members.me!.roles.highest.position) return 'Bu rol benim rolümden yüksek veya eşit.';
  return null;
}

/** Moderatörün ve botun hedef üyeyi yönetebilir olup olmadığını kontrol eder. Hata varsa mesajı döner. */
export function hierarchyError(i: ChatInputCommandInteraction, target: GuildMember): string | null {
  const mod = i.member as GuildMember;
  if (target.id === i.user.id) return 'Kendine işlem uygulayamazsın.';
  if (target.id === i.guild!.ownerId) return 'Sunucu sahibine işlem uygulanamaz.';
  if (target.id === i.client.user.id) return 'Bana işlem uygulayamazsın.';
  if (i.user.id !== i.guild!.ownerId && target.roles.highest.position >= mod.roles.highest.position)
    return 'Bu üyenin rolü seninkinden yüksek veya eşit.';
  if (target.roles.highest.position >= i.guild!.members.me!.roles.highest.position)
    return 'Bu üyenin rolü benim rolümden yüksek veya eşit.';
  return null;
}
