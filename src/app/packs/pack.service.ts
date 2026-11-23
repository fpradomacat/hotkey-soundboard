import { Injectable } from '@angular/core';
import { buildPack, Pack, PackFile, PackIndexFile } from './pack';

export const PACKS_URL = 'assets/packs/';

/** Id of the pack opened at the site root, and the fallback for unknown ids. */
export const DEFAULT_PACK_ID = 'classic';

@Injectable({
  providedIn: 'root'
})
export class PackService {

  private readonly cache = new Map<string, Promise<Pack>>();

  /** Ids of the published packs, in display order. */
  async listPackIds(): Promise<string[]> {
    const index = await this.fetchJson<PackIndexFile>(`${PACKS_URL}index.json`);
    return index.packs;
  }

  /** Loads a pack once; later calls reuse the result. Rejects when the pack does not exist. */
  loadPack(id: string): Promise<Pack> {
    let pack = this.cache.get(id);
    if (!pack) {
      pack = this.fetchPack(id);
      this.cache.set(id, pack);
      // Do not cache failures, so a retry can succeed.
      pack.catch(() => this.cache.delete(id));
    }
    return pack;
  }

  private async fetchPack(id: string): Promise<Pack> {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid pack id "${id}"`);

    const baseUrl = `${PACKS_URL}${id}/`;
    const data = await this.fetchJson<PackFile>(`${baseUrl}pack.json`);
    return buildPack(id, data, baseUrl);
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
    return response.json() as Promise<T>;
  }

}
