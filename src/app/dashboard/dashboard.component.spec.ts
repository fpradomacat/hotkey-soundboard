import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { SoundPlayerService } from '../sound-player.service';
import { testPack } from '../testing/test-pack';
import { provideRouter } from '@angular/router';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let player: SoundPlayerService;
  let playSound: jasmine.Spy;
  let stopSound: jasmine.Spy;

  const element = () => fixture.nativeElement as HTMLElement;
  const input = () => element().querySelector('input') as HTMLInputElement;
  const cards = () => element().querySelectorAll('app-sound-card');

  /** Dispatches a keydown on the window, like the browser does, and returns the event. */
  function pressKey(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {key, cancelable: true, bubbles: true, ...init});
    window.dispatchEvent(event);
    return event;
  }

  async function type(text: string) {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    spyOn(HTMLMediaElement.prototype, 'play').and.resolveTo();
    spyOn(HTMLMediaElement.prototype, 'pause');
    spyOn(HTMLMediaElement.prototype, 'load');
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentRef.setInput('pack', testPack);
    player = TestBed.inject(SoundPlayerService);
    playSound = spyOn(player, 'playSound').and.callThrough();
    stopSound = spyOn(player, 'stopCurrentSound').and.callThrough();
    await fixture.whenStable();
  });

  it('shows all the sections and sounds', () => {
    expect(element().querySelectorAll('app-sounds-section').length).toBe(2);
    expect(cards().length).toBe(7);
  });

  describe('hotkeys', () => {
    it('plays the sound of the pressed key', () => {
      pressKey('q');

      expect(playSound).toHaveBeenCalledTimes(1);
      expect(playSound.calls.mostRecent().args[0].displayName).toBe('Alpha');
    });

    it('works with Caps Lock on', () => {
      pressKey('Q');

      expect(playSound.calls.mostRecent().args[0].displayName).toBe('Alpha');
    });

    it('plays the Ctrl variant and stops the browser shortcut only when it handled the key', () => {
      const handled = pressKey('a', {ctrlKey: true});
      const notHandled = pressKey('y', {ctrlKey: true});

      expect(playSound.calls.mostRecent().args[0].displayName).toBe('Alpha Ctrl');
      expect(handled.defaultPrevented).toBeTrue();
      expect(notHandled.defaultPrevented).toBeFalse();
    });

    it('ignores key auto-repeat so a held key does not restart the clip', () => {
      pressKey('q');
      pressKey('q', {repeat: true});
      pressKey('q', {repeat: true});

      expect(playSound).toHaveBeenCalledTimes(1);
    });

    it('ignores Alt and Meta combinations', () => {
      pressKey('q', {altKey: true});
      pressKey('q', {metaKey: true});

      expect(playSound).not.toHaveBeenCalled();
    });

    it('stops the current sound with Shift', () => {
      pressKey('Shift', {shiftKey: true});

      expect(stopSound).toHaveBeenCalled();
      expect(playSound).not.toHaveBeenCalled();
    });

    it('does nothing for a key without sound', () => {
      const event = pressKey('#');

      expect(playSound).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBeFalse();
    });
  });

  describe('search', () => {
    it('filters the sounds ignoring case and accents', async () => {
      await type('CAFE ROMAN');

      expect(element().querySelectorAll('app-sounds-section').length).toBe(1);
      expect(cards().length).toBe(1);
      expect(element().textContent).toContain('Café Román!');
    });

    it('shows the empty message when nothing matches', async () => {
      await type('zzzzzz');

      expect(cards().length).toBe(0);
      expect(element().textContent).toContain('No hay sonidos');
    });

    it('shows everything again when the search box is cleared', async () => {
      await type('roman');
      await type('');

      expect(cards().length).toBe(7);
    });

    it('does not play sounds from the keyboard while there is search text', async () => {
      await type('alp');

      pressKey('q');

      expect(playSound).not.toHaveBeenCalled();
    });

    it('does not play sounds while typing in the search box', () => {
      input().focus();
      const event = new KeyboardEvent('keydown', {key: 'q', bubbles: true, cancelable: true});
      input().dispatchEvent(event);

      expect(playSound).not.toHaveBeenCalled();
    });

    it('labels the search box for screen readers', () => {
      expect(input().getAttribute('aria-label')).toBe('Buscar sonidos');
    });
  });

  it('announces the sound that is playing to screen readers', async () => {
    pressKey('q');
    await fixture.whenStable();

    expect(element().querySelector('[aria-live]')?.textContent).toContain('Reproduciendo Alpha');
  });
});
