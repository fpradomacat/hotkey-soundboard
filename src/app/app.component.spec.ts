import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('routes', () => {
  beforeEach(() => {
    spyOn(HTMLMediaElement.prototype, 'load');
    TestBed.configureTestingModule({providers: [provideRouter(routes)]});
  });

  it('redirects the empty path to the dashboard', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.querySelectorAll('app-sound-card').length).toBe(28);
  });
});
