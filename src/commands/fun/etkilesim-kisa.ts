import { ACTIONS, sendAction } from './etkilesim';
import { makeCommand } from '../../utils/factory';

/** Her GIF etkileşimi için kısa prefix komutu: .saril @kisi, .tokat @kisi, .dans ... */
const NAMES: Record<string, string> = {
  hug: 'saril',
  pat: 'oksa',
  slap: 'tokat',
  kiss: 'opucuk',
  cuddle: 'sarmala',
  poke: 'durt',
  dance: 'dans',
  cry: 'agla',
  laugh: 'gul',
  wave: 'elsalla',
  bite: 'isir',
  blush: 'kizar',
  smile: 'gulumse',
  wink: 'goz',
  punch: 'yumruk',
  kick: 'tekme',
  tickle: 'gidikla',
  facepalm: 'facepalm',
  shrug: 'omuzsilk',
  bored: 'sikil',
  think: 'dusun',
  pout: 'surat',
  yeet: 'firlat',
  handhold: 'eletut',
};

export default Object.entries(NAMES).map(([action, name]) =>
  makeCommand({
    name,
    desc: `GIF: birine ${ACTIONS[action].replace(/^(ile|a|yüzünden|karşısında|hakkında) /, '')}`.slice(0, 100),
    category: 'Etkileşim',
    options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Kime?')),
    run: (i) => sendAction(i, action),
  }),
);
