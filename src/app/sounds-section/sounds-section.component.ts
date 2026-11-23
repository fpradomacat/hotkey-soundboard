import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Section } from "../classes/Section";

@Component({
    selector: 'app-sounds-section',
    templateUrl: './sounds-section.component.html',
    styleUrls: ['./sounds-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SoundsSectionComponent {

  @Input()
  section!: Section;

}
