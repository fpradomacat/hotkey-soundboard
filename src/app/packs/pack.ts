import { Section } from '../classes/Section';
import { Sound } from '../classes/Sound';

/** Shape of `pack.json`. Packs are validated by `npm run validate:sounds`. */
export interface SoundEntry {
  /** File name inside the pack folder, without the `.mp3` extension. */
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

export interface PackFile {
  title: string;
  description: string;
  sections: SectionEntry[];
}

/** `assets/packs/index.json`: the ids of the packs published on this site. */
export interface PackIndexFile {
  packs: string[];
}

export interface Pack {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

/**
 * @param baseUrl folder that holds the pack's mp3 files, with a trailing slash.
 */
export function buildPack(id: string, data: PackFile, baseUrl: string): Pack {
  return {
    id,
    title: data.title,
    description: data.description,
    sections: data.sections.map(section =>
      new Section(
        section.name,
        section.description,
        section.sounds.map(sound => new Sound(sound.file, sound.name, sound.hotkey ?? '', sound.ctrl ?? false, baseUrl))
      )
    )
  };
}
