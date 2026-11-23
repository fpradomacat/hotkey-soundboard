import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { packResolver } from './packs/pack.resolver';
import { DEFAULT_PACK_ID } from './packs/pack.service';

export const routes: Routes = [
  {path: 'p/:packId', component: DashboardComponent, resolve: {pack: packResolver}},
  // Old URL (before packs existed) and site root.
  {path: '**', redirectTo: `p/${DEFAULT_PACK_ID}`},
];
