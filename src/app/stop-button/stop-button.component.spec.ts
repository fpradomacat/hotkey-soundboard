import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StopButtonComponent } from './stop-button.component';
import { SoundPlayerService } from '../sound-player.service';

describe('StopButtonComponent', () => {
  let fixture: ComponentFixture<StopButtonComponent>;
  let player: SoundPlayerService;

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    spyOn(HTMLMediaElement.prototype, 'pause');
    fixture = TestBed.createComponent(StopButtonComponent);
    player = TestBed.inject(SoundPlayerService);
    await fixture.whenStable();
  });

  it('has an accessible name and announces the Shift shortcut', () => {
    expect(button().getAttribute('aria-label')).toBe('Frenar sonido');
    expect(button().getAttribute('aria-keyshortcuts')).toBe('Shift');
  });

  it('stops the current sound when clicked', () => {
    const stop = spyOn(player, 'stopCurrentSound');

    button().click();

    expect(stop).toHaveBeenCalled();
  });

  it('looks pressed while Shift is held', async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Shift'}));
    await fixture.whenStable();
    expect(button().classList).toContain('stop-button-active');

    window.dispatchEvent(new KeyboardEvent('keyup', {key: 'Shift'}));
    await fixture.whenStable();
    expect(button().classList).not.toContain('stop-button-active');
  });
});
