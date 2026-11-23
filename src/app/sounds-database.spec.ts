import { buildSections, soundSections } from './sounds-database';

describe('sounds database', () => {
  const allSounds = soundSections.flatMap(section => section.getSounds());

  it('builds sections and sounds from the JSON data', () => {
    const sections = buildSections({
      sections: [{
        name: 'Test',
        description: 'A test section',
        sounds: [
          {file: 'one', name: 'One', hotkey: 'o'},
          {file: 'two', name: 'Two', hotkey: 't', ctrl: true},
          {file: 'three', name: 'Three'}
        ]
      }]
    });

    expect(sections.length).toBe(1);
    expect(sections[0].getName()).toBe('Test');
    const [one, two, three] = sections[0].getSounds();
    expect(one.hotkey).toEqual({key: 'o', isCtrlPressed: false});
    expect(two.hotkey).toEqual({key: 't', isCtrlPressed: true});
    expect(three.hasHotkey).toBeFalse();
  });

  it('has at least one sound and every sound has a name', () => {
    expect(allSounds.length).toBeGreaterThan(0);
    expect(allSounds.every(sound => sound.displayName.trim() !== '')).toBeTrue();
  });

  it('does not repeat a hotkey', () => {
    const hotkeys = allSounds.filter(sound => sound.hasHotkey).map(sound => sound.hotkeyToString);
    const repeated = hotkeys.filter((hotkey, index) => hotkeys.indexOf(hotkey) !== index);

    expect(repeated).toEqual([]);
  });
});
