import { buildPack } from './pack';

describe('buildPack', () => {
  const pack = buildPack('demo', {
    title: 'Demo',
    description: 'A demo pack',
    sections: [{
      name: 'Test',
      description: 'A test section',
      sounds: [
        {file: 'one', name: 'One', hotkey: 'o'},
        {file: 'two', name: 'Two', hotkey: 't', ctrl: true},
        {file: 'three', name: 'Three'}
      ]
    }]
  }, 'assets/packs/demo/');

  it('keeps the pack metadata', () => {
    expect(pack.id).toBe('demo');
    expect(pack.title).toBe('Demo');
    expect(pack.description).toBe('A demo pack');
  });

  it('builds sections and sounds from the JSON data', () => {
    expect(pack.sections.length).toBe(1);
    expect(pack.sections[0].getName()).toBe('Test');
    const [one, two, three] = pack.sections[0].getSounds();
    expect(one.hotkey).toEqual({key: 'o', isCtrlPressed: false});
    expect(two.hotkey).toEqual({key: 't', isCtrlPressed: true});
    expect(three.hasHotkey).toBeFalse();
  });

  it('points every sound to the pack folder', () => {
    expect(pack.sections[0].getSounds().map(sound => sound.source)).toEqual([
      'assets/packs/demo/one.mp3',
      'assets/packs/demo/two.mp3',
      'assets/packs/demo/three.mp3'
    ]);
  });
});
