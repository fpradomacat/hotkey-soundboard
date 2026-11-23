import { TestBed } from '@angular/core/testing';
import { PackService } from './pack.service';

describe('PackService', () => {
  let service: PackService;
  let fetchSpy: jasmine.Spy;

  const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body)));
  const packFile = {title: 'Demo', description: 'd', sections: [{name: 'S', description: '', sounds: [{file: 'a', name: 'A', hotkey: 'a'}]}]};

  beforeEach(() => {
    fetchSpy = spyOn(window, 'fetch').and.callFake((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('assets/packs/index.json')) return json({packs: ['demo', 'other']});
      if (url.endsWith('assets/packs/demo/pack.json')) return json(packFile);
      return Promise.resolve(new Response('', {status: 404}));
    });
    service = TestBed.inject(PackService);
  });

  it('lists the published pack ids', async () => {
    expect(await service.listPackIds()).toEqual(['demo', 'other']);
  });

  it('loads a pack with its audio folder as base URL', async () => {
    const pack = await service.loadPack('demo');

    expect(pack.title).toBe('Demo');
    expect(pack.sections[0].getSounds()[0].source).toBe('assets/packs/demo/a.mp3');
  });

  it('loads each pack only once', async () => {
    await service.loadPack('demo');
    await service.loadPack('demo');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('rejects an unknown pack and does not cache the failure', async () => {
    await expectAsync(service.loadPack('missing')).toBeRejected();
    await expectAsync(service.loadPack('missing')).toBeRejected();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('rejects ids that could escape the packs folder', async () => {
    await expectAsync(service.loadPack('../secret')).toBeRejected();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
