import { Component, ElementRef, HostListener, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { SoundPlayerService } from "../sound-player.service";
import { SoundsLibraryService } from "../sounds-library.service";
import { Hotkey } from "../classes/Hotkey";
import { Section } from "../classes/Section";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DashboardComponent {
  searchText: string = "";
  searchResults?: Section;

  @ViewChild('searchInput')
  searchInput!: ElementRef;
  isInputTextFocused: boolean = false;

  constructor(public soundsLibraryService: SoundsLibraryService,
              private soundPlayerService: SoundPlayerService) {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPressed(event: KeyboardEvent) {
    if (this.isInputTextFocused || this.searchText || !event.key) return;

    if (event.shiftKey) {
      this.soundPlayerService.stopCurrentSound();
      return;
    }

    // Ignore key auto-repeat (would restart the clip) and Alt/Meta combinations.
    if (event.repeat || event.altKey || event.metaKey) return;

    // toLowerCase: with Caps Lock on, event.key is uppercase.
    const hotkey: Hotkey = {key: event.key.toLowerCase(), isCtrlPressed: event.ctrlKey};
    const wasPlayed = this.soundPlayerService.playSoundByHotkey(hotkey);

    // Avoid the browser's own shortcut (e.g. Ctrl+A = select all) only when we handled the key.
    if (wasPlayed) event.preventDefault();
  }

  onSearchTextChange(text: string): void {
    this.searchText = text;
    // Built once per change, not on every change-detection pass.
    this.searchResults = text ? this.soundsLibraryService.searchSoundsByText(text) : undefined;
  }
}
