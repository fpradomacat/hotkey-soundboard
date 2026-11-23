import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PackSelectorComponent } from './pack-selector.component';
import { PackService } from '../packs/pack.service';
import { buildPack } from '../packs/pack';

describe('PackSelectorComponent', () => {
  const make = (id: string) => buildPack(id, {title: `Pack ${id}`, description: `About ${id}`, sections: []}, `assets/packs/${id}/`);

  async function render(ids: string[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: PackService, useValue: {listPackIds: async () => ids, loadPack: async (id: string) => make(id)}}
      ]
    });
    const fixture = TestBed.createComponent(PackSelectorComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('links to every pack', async () => {
    const element = await render(['one', 'two']);
    const links = Array.from(element.querySelectorAll('a'));

    expect(links.map(link => link.textContent?.trim())).toEqual(['Pack one', 'Pack two']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/p/one', '/p/two']);
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Packs de sonidos');
  });

  it('is hidden when there is a single pack', async () => {
    const element = await render(['one']);

    expect(element.querySelector('nav')).toBeNull();
  });
});
