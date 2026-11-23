import { TestBed } from '@angular/core/testing';
import { SoundsLibraryService } from './sounds-library.service';

describe('SoundsLibraryService', () => {
  let service: SoundsLibraryService;

  beforeEach(() => {
    service = TestBed.inject(SoundsLibraryService);
  });

  it('finds a sound by its hotkey', () => {
    const sound = service.getSoundByHotkey({key: 'q', isCtrlPressed: false});
    expect(sound?.displayName).toBe('Gemido');
  });

  it('tells apart the same key with and without Ctrl', () => {
    const plain = service.getSoundByHotkey({key: '1', isCtrlPressed: false});
    const withCtrl = service.getSoundByHotkey({key: '1', isCtrlPressed: true});

    expect(plain?.displayName).toBe('Relato 3-1');
    expect(withCtrl?.displayName).toBe('River 3-1 Boca');
  });

  it('returns nothing for an unknown or empty key', () => {
    expect(service.getSoundByHotkey({key: '#', isCtrlPressed: false})).toBeUndefined();
    // A sound without hotkey stores an empty key; an empty key must never match it.
    expect(service.getSoundByHotkey({key: '', isCtrlPressed: false})).toBeUndefined();
  });

  it('searches ignoring case and accents', () => {
    const names = (text: string) => service.searchSoundsByText(text).getSounds().map(sound => sound.displayName);

    expect(names('INVENTE')).toContain('Invente Román!');
    expect(names('roman')).toEqual(['Invente Román!']);
    expect(names('nadama')).toEqual(['Nadamá']);
  });

  it('returns an empty result section when nothing matches', () => {
    const results = service.searchSoundsByText('zzzzzz');

    expect(results.getName()).toBe('Resultados');
    expect(results.getSounds()).toEqual([]);
  });
});
