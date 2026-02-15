import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapsLayoutComponent } from './maps/maps-layout/maps-layout.component';

const routes: Routes = [
  { path: '', component: MapsLayoutComponent },
  { path: 'control-panel-lazy-loading', component: MapsLayoutComponent },
  { path: 'control-panel-clustering', component: MapsLayoutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
