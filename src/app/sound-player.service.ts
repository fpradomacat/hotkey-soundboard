import { Injectable } from '@angular/core';
import { SoundPlayer } from "./sound-player";
import { Sound } from "./classes/Sound";
import { Hotkey } from "./classes/Hotkey";
import { SoundsLibraryService } from "./sounds-library.service";

@Injectable({
  providedIn: 'root'
})
export class SoundPlayerService extends SoundPlayer {
  private audio = new Audio();

  constructor(private soundsLibraryService: SoundsLibraryService) {
    super();
  }

  public playSound(sound: Sound): void {
    this.audio.src = sound.source;
    this.play();
  }

  /** Plays the sound bound to the hotkey. Returns true if there was one. */
  public playSoundByHotkey(hotkey: Hotkey): boolean {
    const sound = this.soundsLibraryService.getSoundByHotkey(hotkey);
    if (!sound) return false;

    this.playSound(sound);
    return true;
  }

  public stopCurrentSound(): void {
    this.audio.pause();
  }

  private play(): void {
    this.audio.load();
    this.audio.play().catch(error => {
      // AbortError is expected when a new sound interrupts the previous one.
      if (error?.name !== 'AbortError') console.error('Could not play sound', error);
    });
  }
}
