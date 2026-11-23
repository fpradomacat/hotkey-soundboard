import { buildPack } from '../packs/pack';

/** Small pack with the cases the specs need: Ctrl variants, accents, and a sound without hotkey. */
export const testPack = buildPack('test', {
  title: 'Test pack',
  description: 'Pack used by the specs',
  sections: [
    {
      name: 'One',
      description: 'First section',
      sounds: [
        {file: 'alpha', name: 'Alpha', hotkey: 'q'},
        {file: 'bravo', name: 'Bravo', hotkey: 'w'},
        {file: 'alpha-ctrl', name: 'Alpha Ctrl', hotkey: 'a', ctrl: true},
        {file: 'no-key', name: 'Sin atajo'}
      ]
    },
    {
      name: 'Two',
      description: 'Second section',
      sounds: [
        {file: 'cafe', name: 'Café Román!', hotkey: '1'},
        {file: 'cafe-ctrl', name: 'Café Ctrl', hotkey: '1', ctrl: true},
        {file: 'nandu', name: 'Ñandú', hotkey: 'n'}
      ]
    }
  ]
}, 'assets/packs/test/');
