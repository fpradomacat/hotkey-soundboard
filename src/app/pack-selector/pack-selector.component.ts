import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PackService } from '../packs/pack.service';

/** Links to every pack published on the site. */
@Component({
  selector: 'app-pack-selector',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './pack-selector.component.html',
  styleUrl: './pack-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackSelectorComponent {
  private readonly packService = inject(PackService);

  protected readonly packs = resource({
    loader: async () => Promise.all((await this.packService.listPackIds()).map(id => this.packService.loadPack(id)))
  });
}
