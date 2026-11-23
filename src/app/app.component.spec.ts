import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { PackService } from './packs/pack.service';
import { testPack } from './testing/test-pack';

describe('routes', () => {
  let loadPack: jasmine.Spy;

  beforeEach(() => {
    spyOn(HTMLMediaElement.prototype, 'load');
    loadPack = jasmine.createSpy('loadPack').and.callFake(async (id: string) => {
      if (id === 'test' || id === 'classic') return {...testPack, id};
      throw new Error('not found');
    });
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {provide: PackService, useValue: {loadPack, listPackIds: async () => ['classic', 'test']}}
      ]
    });
  });

  const cards = (harness: RouterTestingHarness) => harness.routeNativeElement?.querySelectorAll('app-sound-card').length;

  it('redirects the root to the default pack', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    expect(TestBed.inject(Router).url).toBe('/p/classic');
    expect(cards(harness)).toBe(7);
  });

  it('opens the pack of the URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/p/test');

    expect(TestBed.inject(Router).url).toBe('/p/test');
    expect(loadPack).toHaveBeenCalledWith('test');
  });

  it('sends an unknown pack to the default one', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/p/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/p/classic');
  });

  it('keeps the old /dashboard URL working', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/p/classic');
  });
});
