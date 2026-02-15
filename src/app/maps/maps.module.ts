import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { MapsRoutingModule } from './maps-routing.module';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { ControlPanelLayersComponent } from './esri-map/control-panel-layers/control-panel-layers.component';
import { MapsLayoutComponent } from './maps-layout/maps-layout.component';
import { LayersService } from './services/layers.service';
import { ContolPanelLazyLoadingComponent } from './contol-panel-lazy-loading/contol-panel-lazy-loading.component';


@NgModule({
  declarations: [
    EsriMapComponent,
    ControlPanelLayersComponent,
    MapsLayoutComponent,
    ContolPanelLazyLoadingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MapsRoutingModule,
    TooltipModule,
    ToolbarModule,
    ButtonModule,
    RippleModule
  ],
  providers: [
    LayersService
  ],
  exports: [
    EsriMapComponent,
    MapsLayoutComponent
  ]
})
export class MapsModule { }
