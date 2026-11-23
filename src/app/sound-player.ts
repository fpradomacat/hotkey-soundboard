import { Sound } from "./classes/Sound";
import { Hotkey } from "./classes/Hotkey";

export abstract class SoundPlayer {

  abstract playSound(sound: Sound): void;

  abstract playSoundByHotkey(hotkey: Hotkey): boolean;

  abstract stopCurrentSound(): void;
}
