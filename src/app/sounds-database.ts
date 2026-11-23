import { Section } from './classes/Section';
import { Sound } from './classes/Sound';
import soundsFile from './sounds.json';

/** Shape of `sounds.json`. The file is validated by `npm run validate:sounds`. */
export interface SoundEntry {
  /** File name inside `src/assets/audio`, without the `.mp3` extension. */
  file: string;
  /** Text shown on the card and used by the search. */
  name: string;
  /** Single `KeyboardEvent.key` value. Omit it for a sound without hotkey. */
  hotkey?: string;
  /** True when the hotkey needs Ctrl pressed. */
  ctrl?: boolean;
}

export interface SectionEntry {
  name: string;
  description: string;
  sounds: SoundEntry[];
}

export interface SoundsFile {
  sections: SectionEntry[];
}

export function buildSections(data: SoundsFile): Section[] {
  return data.sections.map(section =>
    new Section(
      section.name,
      section.description,
      section.sounds.map(sound => new Sound(sound.file, sound.name, sound.hotkey ?? '', sound.ctrl ?? false))
    )
  );
}

export const soundSections: Section[] = buildSections(soundsFile);
