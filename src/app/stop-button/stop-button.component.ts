import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SoundPlayerService } from '../sound-player.service';

@Component({
  selector: 'app-stop-button',
  templateUrl: './stop-button.component.html',
  styleUrl: './stop-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Shift is the keyboard shortcut for stop: show the button as pressed while it is held.
    '(window:keydown.shift)': 'isStopButtonActive.set(true)',
    '(window:keyup.shift)': 'isStopButtonActive.set(false)'
  }
})
export class StopButtonComponent {
  private readonly soundPlayerService = inject(SoundPlayerService);

  protected readonly isStopButtonActive = signal(false);

  protected stopCurrentSound(): void {
    this.soundPlayerService.stopCurrentSound();
  }
}
