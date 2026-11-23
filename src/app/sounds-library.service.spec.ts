import { TestBed } from '@angular/core/testing';
import { SoundsLibraryService } from './sounds-library.service';
import { testPack } from './testing/test-pack';

describe('SoundsLibraryService', () => {
  let service: SoundsLibraryService;

  beforeEach(() => {
    service = TestBed.inject(SoundsLibraryService);
    service.setPack(testPack);
  });

  it('has no sounds until a pack is set', () => {
    const empty = new SoundsLibraryService();

    expect(empty.soundSections()).toEqual([]);
    expect(empty.getSoundByHotkey({key: 'q', isCtrlPressed: false})).toBeUndefined();
  });

  it('finds a sound by its hotkey', () => {
    const sound = service.getSoundByHotkey({key: 'q', isCtrlPressed: false});
    expect(sound?.displayName).toBe('Alpha');
  });

  it('tells apart the same key with and without Ctrl', () => {
    const plain = service.getSoundByHotkey({key: '1', isCtrlPressed: false});
    const withCtrl = service.getSoundByHotkey({key: '1', isCtrlPressed: true});

    expect(plain?.displayName).toBe('Café Román!');
    expect(withCtrl?.displayName).toBe('Café Ctrl');
  });

  it('returns nothing for an unknown or empty key', () => {
    expect(service.getSoundByHotkey({key: '#', isCtrlPressed: false})).toBeUndefined();
    // A sound without hotkey stores an empty key; an empty key must never match it.
    expect(service.getSoundByHotkey({key: '', isCtrlPressed: false})).toBeUndefined();
  });

  it('searches ignoring case and accents', () => {
    const names = (text: string) => service.searchSoundsByText(text).getSounds().map(sound => sound.displayName);

    expect(names('CAFE')).toEqual(['Café Román!', 'Café Ctrl']);
    expect(names('roman')).toEqual(['Café Román!']);
    expect(names('nandu')).toEqual(['Ñandú']);
  });

  it('switches the sounds when another pack is set', () => {
    service.setPack({...testPack, id: 'other', sections: []});

    expect(service.getSoundByHotkey({key: 'q', isCtrlPressed: false})).toBeUndefined();
  });

  it('returns an empty result section when nothing matches', () => {
    const results = service.searchSoundsByText('zzzzzz');

    expect(results.getName()).toBe('Resultados');
    expect(results.getSounds()).toEqual([]);
  });
});
