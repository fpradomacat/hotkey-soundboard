// Checks every pack in src/assets/packs: index.json, pack.json and the mp3 files.
// Run with `npm run validate:sounds`. Exits with code 1 when something is wrong.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packsDir = join(root, 'src/assets/packs');
const errors = [];

const readJson = path => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${path}: ${error.message}`);
    return null;
  }
};

const index = readJson(join(packsDir, 'index.json'));
const listed = index?.packs ?? [];
if (index && (!Array.isArray(listed) || listed.length === 0)) errors.push('index.json: "packs" must be a non-empty array.');

const folders = readdirSync(packsDir).filter(name => statSync(join(packsDir, name)).isDirectory());
for (const folder of folders) {
  if (!listed.includes(folder)) errors.push(`packs/${folder} is not listed in index.json.`);
}

let totalSounds = 0;
let totalHotkeys = 0;

for (const id of listed) {
  const folder = join(packsDir, id);
  if (!/^[a-z0-9-]+$/.test(id)) errors.push(`index.json: pack id "${id}" must be lower case letters, digits and "-".`);
  if (!existsSync(folder)) {
    errors.push(`index.json: packs/${id} does not exist.`);
    continue;
  }
  const data = readJson(join(folder, 'pack.json'));
  if (!data) continue;

  if (!data.title) errors.push(`${id}: missing "title".`);
  const audioFiles = new Set(
    readdirSync(folder).filter(name => name.endsWith('.mp3')).map(name => name.slice(0, -'.mp3'.length))
  );
  const filesSeen = new Map();
  const hotkeysSeen = new Map();

  for (const section of data.sections ?? []) {
    if (!section.name) errors.push(`${id}: a section has no name.`);

    for (const sound of section.sounds ?? []) {
      const label = `${id}: "${sound.name}" (${sound.file}) in "${section.name}"`;

      if (!sound.file) errors.push(`${label}: missing "file".`);
      if (!sound.name) errors.push(`${label}: missing "name".`);

      if (sound.file && !audioFiles.has(sound.file)) {
        errors.push(`${label}: packs/${id}/${sound.file}.mp3 does not exist.`);
      }
      if (filesSeen.has(sound.file)) {
        errors.push(`${label}: file already used by ${filesSeen.get(sound.file)}.`);
      }
      filesSeen.set(sound.file, label);

      if (sound.hotkey !== undefined) {
        if ([...sound.hotkey].length !== 1) {
          errors.push(`${label}: "hotkey" must be a single character, got "${sound.hotkey}".`);
        }
        const key = `${sound.ctrl ? 'Ctrl+' : ''}${sound.hotkey.toLowerCase()}`;
        if (hotkeysSeen.has(key)) errors.push(`${label}: hotkey ${key} is already used by ${hotkeysSeen.get(key)}.`);
        hotkeysSeen.set(key, label);
      } else if (sound.ctrl) {
        errors.push(`${label}: "ctrl" is set but there is no "hotkey".`);
      }
    }
  }

  for (const file of audioFiles) {
    if (!filesSeen.has(file)) errors.push(`${id}: packs/${id}/${file}.mp3 is not used by any sound.`);
  }
  totalSounds += filesSeen.size;
  totalHotkeys += hotkeysSeen.size;
}

if (errors.length > 0) {
  console.error(`Packs have ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`${listed.length} packs are valid: ${totalSounds} sounds, ${totalHotkeys} hotkeys.`);
