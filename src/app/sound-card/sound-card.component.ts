import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Sound } from '../classes/Sound';
import { SoundPlayerService } from '../sound-player.service';

@Component({
  selector: 'app-sound-card',
  templateUrl: './sound-card.component.html',
  styleUrl: './sound-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundCardComponent {
  readonly sound = input.required<Sound>();

  private readonly soundPlayerService = inject(SoundPlayerService);

  /** True while this card's sound is the one playing. */
  protected readonly isPlaying = computed(() => this.soundPlayerService.currentSound() === this.sound());

  protected play(): void {
    this.soundPlayerService.playSound(this.sound());
  }
}
