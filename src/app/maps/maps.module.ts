import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

import { MapsRoutingModule } from './maps-routing.module';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { ControlPanelLayersComponent } from './esri-map/control-panel-layers/control-panel-layers.component';
import { MapsLayoutComponent } from './maps-layout/maps-layout.component';
import { LayersService } from './services/layers.service';


@NgModule({
  declarations: [
    EsriMapComponent,
    ControlPanelLayersComponent,
    MapsLayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MapsRoutingModule,
    TooltipModule,
    ToolbarModule,
    ButtonModule
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
