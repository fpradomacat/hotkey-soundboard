import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Section } from '../classes/Section';
import { SoundCardComponent } from '../sound-card/sound-card.component';

@Component({
  selector: 'app-sounds-section',
  imports: [SoundCardComponent],
  templateUrl: './sounds-section.component.html',
  styleUrl: './sounds-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundsSectionComponent {
  readonly section = input.required<Section>();
}
