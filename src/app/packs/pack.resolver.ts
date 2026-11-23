import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { Pack } from './pack';
import { DEFAULT_PACK_ID, PackService } from './pack.service';

/** Loads the pack of the `:packId` route param; unknown packs redirect to the default one. */
export const packResolver: ResolveFn<Pack | RedirectCommand> = async route => {
  const packService = inject(PackService);
  const router = inject(Router);
  const id = route.paramMap.get('packId') ?? DEFAULT_PACK_ID;

  try {
    return await packService.loadPack(id);
  } catch {
    return new RedirectCommand(router.parseUrl(`/p/${DEFAULT_PACK_ID}`), {replaceUrl: true});
  }
};
