import { Sound } from './classes/Sound';
import { Hotkey } from './classes/Hotkey';

export abstract class SoundPlayer {

  abstract playSound(sound: Sound): void;

  /** Plays the sound bound to the hotkey. Returns true if there was one. */
  abstract playSoundByHotkey(hotkey: Hotkey): boolean;

  abstract stopCurrentSound(): void;
}
