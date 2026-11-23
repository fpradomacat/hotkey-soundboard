import { inject, Injectable, signal } from '@angular/core';
import { SoundPlayer } from './sound-player';
import { Sound } from './classes/Sound';
import { Hotkey } from './classes/Hotkey';
import { SoundsLibraryService } from './sounds-library.service';

@Injectable({
  providedIn: 'root'
})
export class SoundPlayerService extends SoundPlayer {
  private readonly soundsLibraryService = inject(SoundsLibraryService);

  // A single shared element: playing a sound always cuts the previous one.
  private readonly audio = new Audio();

  private readonly _currentSound = signal<Sound | null>(null);

  /** The sound that is playing right now, or null. */
  readonly currentSound = this._currentSound.asReadonly();

  constructor() {
    super();
    const clearCurrentSound = () => this._currentSound.set(null);
    this.audio.addEventListener('ended', clearCurrentSound);
    this.audio.addEventListener('pause', clearCurrentSound);
    this.audio.addEventListener('error', clearCurrentSound);
  }

  playSound(sound: Sound): void {
    this.audio.src = sound.source;
    this.audio.load();
    this._currentSound.set(sound);
    this.audio.play().catch(error => {
      // AbortError is expected when a new sound interrupts the previous one.
      if (error?.name === 'AbortError') return;

      this._currentSound.set(null);
      console.error('Could not play sound', error);
    });
  }

  playSoundByHotkey(hotkey: Hotkey): boolean {
    const sound = this.soundsLibraryService.getSoundByHotkey(hotkey);
    if (!sound) return false;

    this.playSound(sound);
    return true;
  }

  stopCurrentSound(): void {
    this.audio.pause();
    this._currentSound.set(null);
  }
}
