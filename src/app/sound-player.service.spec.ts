import { TestBed } from '@angular/core/testing';
import { SoundPlayerService } from './sound-player.service';
import { SoundsLibraryService } from './sounds-library.service';
import { Sound } from './classes/Sound';
import { testPack } from './testing/test-pack';

describe('SoundPlayerService', () => {
  let service: SoundPlayerService;
  let playSpy: jasmine.Spy;
  let pauseSpy: jasmine.Spy;
  const sound = new Sound('alpha', 'Alpha', 'q');

  beforeEach(() => {
    playSpy = spyOn(HTMLMediaElement.prototype, 'play').and.resolveTo();
    pauseSpy = spyOn(HTMLMediaElement.prototype, 'pause');
    spyOn(HTMLMediaElement.prototype, 'load');
    TestBed.inject(SoundsLibraryService).setPack(testPack);
    service = TestBed.inject(SoundPlayerService);
  });

  it('plays a sound and exposes it as the current one', () => {
    service.playSound(sound);

    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(service.currentSound()).toBe(sound);
  });

  it('clears the current sound when it is stopped', () => {
    service.playSound(sound);
    service.stopCurrentSound();

    expect(pauseSpy).toHaveBeenCalled();
    expect(service.currentSound()).toBeNull();
  });

  it('plays the sound bound to a hotkey and says so', () => {
    const wasPlayed = service.playSoundByHotkey({key: 'q', isCtrlPressed: false});

    expect(wasPlayed).toBeTrue();
    expect(service.currentSound()?.displayName).toBe('Alpha');
  });

  it('does nothing and says so when no sound has that hotkey', () => {
    const wasPlayed = service.playSoundByHotkey({key: '#', isCtrlPressed: false});

    expect(wasPlayed).toBeFalse();
    expect(playSpy).not.toHaveBeenCalled();
    expect(service.currentSound()).toBeNull();
  });

  it('keeps the sound when playback is interrupted by another one (AbortError)', async () => {
    playSpy.and.rejectWith(new DOMException('interrupted', 'AbortError'));
    const consoleError = spyOn(console, 'error');

    service.playSound(sound);
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
    expect(service.currentSound()).toBe(sound);
  });

  it('logs the error and clears the sound when playback fails for another reason', async () => {
    playSpy.and.rejectWith(new DOMException('blocked', 'NotAllowedError'));
    const consoleError = spyOn(console, 'error');

    service.playSound(sound);
    await Promise.resolve();
    await Promise.resolve();

    expect(consoleError).toHaveBeenCalled();
    expect(service.currentSound()).toBeNull();
  });

  it('resolves the audio file relative to the base href', () => {
    service.playSound(sound);

    const audio = (service as unknown as { audio: HTMLAudioElement }).audio;
    expect(audio.src).toBe(new URL('assets/audio/alpha.mp3', document.baseURI).href);
  });

  it('is injected with the library service', () => {
    expect(TestBed.inject(SoundsLibraryService)).toBeTruthy();
  });
});
