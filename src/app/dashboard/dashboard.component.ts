import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SoundPlayerService } from '../sound-player.service';
import { SoundsLibraryService } from '../sounds-library.service';
import { Hotkey } from '../classes/Hotkey';
import { StopButtonComponent } from '../stop-button/stop-button.component';
import { SoundsSectionComponent } from '../sounds-section/sounds-section.component';

@Component({
  selector: 'app-dashboard',
  imports: [StopButtonComponent, SoundsSectionComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyPressed($event)'
  }
})
export class DashboardComponent {
  protected readonly soundsLibraryService = inject(SoundsLibraryService);
  private readonly soundPlayerService = inject(SoundPlayerService);

  protected readonly searchText = signal('');

  /** Search results, or null while the search box is empty. Recomputed only when the text changes. */
  protected readonly searchResults = computed(() => {
    const text = this.searchText();
    return text ? this.soundsLibraryService.searchSoundsByText(text) : null;
  });

  protected readonly currentSound = this.soundPlayerService.currentSound;

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  handleKeyPressed(event: KeyboardEvent): void {
    if (this.searchText() || !event.key || isTypingTarget(event.target)) return;

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
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
}
