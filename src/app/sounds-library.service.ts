import { Injectable } from '@angular/core';
import { Section } from './classes/Section';
import { soundSections } from './sounds-database';
import { Sound } from './classes/Sound';
import { Hotkey } from './classes/Hotkey';

@Injectable({
  providedIn: 'root'
})
export class SoundsLibraryService {

  readonly soundSections: Section[] = soundSections;

  private readonly allSounds: Sound[] = this.soundSections.flatMap(section => section.getSounds());

  getSoundByHotkey(hotkey: Hotkey): Sound | undefined {
    if (!hotkey.key) return undefined;

    return this.allSounds.find(sound => sound.isSameHotkey(hotkey));
  }

  searchSoundsByText(searchText: string): Section {
    const normalizedText = this.normalize(searchText);
    const sounds = this.allSounds.filter(sound => this.normalize(sound.displayName).includes(normalizedText));

    return new Section('Resultados', '', sounds);
  }

  /** Lower case and without accents, so "invente" finds "Invente Román!". */
  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

}
