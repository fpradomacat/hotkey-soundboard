import { Hotkey } from './Hotkey';

export class Sound {

  private readonly _source: string;
  private readonly _displayName: string;
  private readonly _hotkey: Hotkey;

  constructor(_source: string,
              _displayName: string,
              _key: string = '',
              _isCtrlPressed: boolean = false) {
    this._source = _source;
    this._displayName = _displayName;
    this._hotkey = {key: _key.toLowerCase(), isCtrlPressed: _isCtrlPressed};
  }

  get displayName() {
    return this._displayName;
  }

  get source() {
    // Relative on purpose: the browser resolves it against <base href>,
    // so it works in dev ('/') and on GitHub Pages ('/<repo-name>/').
    return `assets/audio/${this._source}.mp3`;
  }

  get hotkeyToString() {
    return `${this._hotkey.isCtrlPressed ? 'CTRL + ' : ''}${this._hotkey.key.toUpperCase()}`;
  }

  get hotkey() {
    return this._hotkey;
  }

  isSameHotkey(hotkey: Hotkey) {
    return this._hotkey.key === hotkey.key &&
      this._hotkey.isCtrlPressed === hotkey.isCtrlPressed;
  }
}
