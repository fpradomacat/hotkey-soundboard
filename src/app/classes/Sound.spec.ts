import { Sound } from './Sound';

describe('Sound', () => {
  it('builds a relative asset path so it works under any <base href>', () => {
    const sound = new Sound('gemido', 'Gemido', 'q');
    expect(sound.source).toBe('assets/audio/gemido.mp3');
  });

  it('stores the hotkey in lower case so Caps Lock does not break it', () => {
    const sound = new Sound('gemido', 'Gemido', 'Q');
    expect(sound.isSameHotkey({key: 'q', isCtrlPressed: false})).toBeTrue();
  });

  it('distinguishes the same key with and without Ctrl', () => {
    const sound = new Sound('el-taco-no_ampli', 'El taco no!', 'a', true);
    expect(sound.isSameHotkey({key: 'a', isCtrlPressed: false})).toBeFalse();
    expect(sound.isSameHotkey({key: 'a', isCtrlPressed: true})).toBeTrue();
  });
});
