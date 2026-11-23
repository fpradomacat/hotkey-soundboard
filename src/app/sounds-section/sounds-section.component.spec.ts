import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundsSectionComponent } from './sounds-section.component';
import { Section } from '../classes/Section';
import { Sound } from '../classes/Sound';

describe('SoundsSectionComponent', () => {
  let fixture: ComponentFixture<SoundsSectionComponent>;

  async function render(section: Section) {
    fixture = TestBed.createComponent(SoundsSectionComponent);
    fixture.componentRef.setInput('section', section);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the section name as a heading and one card per sound', async () => {
    const element = await render(new Section('Test', '', [
      new Sound('a', 'Uno', 'a'),
      new Sound('b', 'Dos', 'b')
    ]));

    expect(element.querySelector('h2')?.textContent).toContain('Test');
    expect(element.querySelectorAll('app-sound-card').length).toBe(2);
    expect(element.querySelector('.no-data-label')).toBeNull();
  });

  it('says there are no sounds when the section is empty', async () => {
    const element = await render(new Section('Resultados', '', []));

    expect(element.querySelectorAll('app-sound-card').length).toBe(0);
    expect(element.querySelector('.no-data-label')?.textContent).toContain('No hay sonidos');
  });
});
