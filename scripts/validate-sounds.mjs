// Checks src/app/sounds.json against the files in src/assets/audio.
// Run with `npm run validate:sounds`. Exits with code 1 when something is wrong.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'src/app/sounds.json'), 'utf8'));
const audioFiles = new Set(
  readdirSync(join(root, 'src/assets/audio'))
    .filter(name => name.endsWith('.mp3'))
    .map(name => name.slice(0, -'.mp3'.length))
);

const errors = [];
const filesSeen = new Map();
const hotkeysSeen = new Map();

for (const section of data.sections) {
  if (!section.name) errors.push('A section has no name.');

  for (const sound of section.sounds) {
    const label = `"${sound.name}" (${sound.file}) in "${section.name}"`;

    if (!sound.file) errors.push(`${label}: missing "file".`);
    if (!sound.name) errors.push(`${label}: missing "name".`);

    if (sound.file && !audioFiles.has(sound.file)) {
      errors.push(`${label}: src/assets/audio/${sound.file}.mp3 does not exist.`);
    }

    if (filesSeen.has(sound.file)) {
      errors.push(`${label}: file already used by ${filesSeen.get(sound.file)}.`);
    }
    filesSeen.set(sound.file, label);

    if (sound.hotkey !== undefined) {
      if ([...sound.hotkey].length !== 1) {
        errors.push(`${label}: "hotkey" must be a single character, got "${sound.hotkey}".`);
      }
      const id = `${sound.ctrl ? 'Ctrl+' : ''}${sound.hotkey.toLowerCase()}`;
      if (hotkeysSeen.has(id)) {
        errors.push(`${label}: hotkey ${id} is already used by ${hotkeysSeen.get(id)}.`);
      }
      hotkeysSeen.set(id, label);
    } else if (sound.ctrl) {
      errors.push(`${label}: "ctrl" is set but there is no "hotkey".`);
    }
  }
}

for (const file of audioFiles) {
  if (!filesSeen.has(file)) errors.push(`src/assets/audio/${file}.mp3 is not used by any sound.`);
}

if (errors.length > 0) {
  console.error(`sounds.json has ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`sounds.json is valid: ${filesSeen.size} sounds, ${hotkeysSeen.size} hotkeys.`);
