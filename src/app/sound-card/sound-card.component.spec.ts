import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundCardComponent } from './sound-card.component';
import { SoundPlayerService } from '../sound-player.service';
import { Sound } from '../classes/Sound';

describe('SoundCardComponent', () => {
  let fixture: ComponentFixture<SoundCardComponent>;
  let player: SoundPlayerService;
  const sound = new Sound('alpha', 'Alpha', 'q');

  function setup(value: Sound) {
    spyOn(HTMLMediaElement.prototype, 'play').and.resolveTo();
    spyOn(HTMLMediaElement.prototype, 'pause');
    spyOn(HTMLMediaElement.prototype, 'load');
    fixture = TestBed.createComponent(SoundCardComponent);
    player = TestBed.inject(SoundPlayerService);
    fixture.componentRef.setInput('sound', value);
  }

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  it('renders a real button with an accessible name and its keyboard shortcut', async () => {
    setup(sound);
    await fixture.whenStable();

    expect(button().getAttribute('aria-label')).toBe('Reproducir Alpha');
    expect(button().getAttribute('aria-keyshortcuts')).toBe('Q');
    expect(fixture.nativeElement.textContent).toContain('Alpha');
  });

  it('plays its sound when the button is clicked', async () => {
    setup(sound);
    await fixture.whenStable();
    const playSound = spyOn(player, 'playSound').and.callThrough();

    button().click();

    expect(playSound).toHaveBeenCalledWith(sound);
  });

  it('is highlighted only while its own sound is playing', async () => {
    setup(sound);
    const container = () => fixture.nativeElement.querySelector('.button-container') as HTMLElement;
    await fixture.whenStable();
    expect(container().classList).not.toContain('playing');

    player.playSound(sound);
    await fixture.whenStable();
    expect(container().classList).toContain('playing');

    player.playSound(new Sound('otro', 'Otro', 'x'));
    await fixture.whenStable();
    expect(container().classList).not.toContain('playing');
  });

  it('does not show a hotkey badge for a sound without hotkey', async () => {
    setup(new Sound('va-el-tercero_loop', 'Y va el tercero!'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.shortcut')).toBeNull();
    expect(button().hasAttribute('aria-keyshortcuts')).toBeFalse();
  });
});
