import { computed, Injectable, signal } from '@angular/core';
import { Section } from './classes/Section';
import { Sound } from './classes/Sound';
import { Hotkey } from './classes/Hotkey';
import { Pack } from './packs/pack';

/** Sounds of the pack that is open right now. */
@Injectable({
  providedIn: 'root'
})
export class SoundsLibraryService {

  private readonly pack = signal<Pack | null>(null);

  readonly soundSections = computed(() => this.pack()?.sections ?? []);

  private readonly allSounds = computed(() => this.soundSections().flatMap(section => section.getSounds()));

  setPack(pack: Pack): void {
    this.pack.set(pack);
  }

  getSoundByHotkey(hotkey: Hotkey): Sound | undefined {
    if (!hotkey.key) return undefined;

    return this.allSounds().find(sound => sound.isSameHotkey(hotkey));
  }

  searchSoundsByText(searchText: string): Section {
    const normalizedText = this.normalize(searchText);
    const sounds = this.allSounds().filter(sound => this.normalize(sound.displayName).includes(normalizedText));

    return new Section('Resultados', '', sounds);
  }

  /** Lower case and without accents, so "invente" finds "Invente Román!". */
  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

}
