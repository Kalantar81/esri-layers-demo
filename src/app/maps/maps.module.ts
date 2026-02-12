import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MapsRoutingModule } from './maps-routing.module';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { ControlPanelLayersComponent } from './esri-map/control-panel-layers/control-panel-layers.component';
import { LayersService } from './services/layers.service';


@NgModule({
  declarations: [
    EsriMapComponent,
    ControlPanelLayersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MapsRoutingModule
  ],
  providers: [
    LayersService
  ],
  exports: [
    EsriMapComponent
  ]
})
export class MapsModule { }
