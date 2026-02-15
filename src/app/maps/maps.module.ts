import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputSwitchModule } from 'primeng/inputswitch';

import { MapsRoutingModule } from './maps-routing.module';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { ControlPanelLayersComponent } from './esri-map/control-panels/control-panel-layers/control-panel-layers.component';
import { MapsLayoutComponent } from './maps-layout/maps-layout.component';
import { LayersService } from './services/layers.service';
import { ContolPanelLazyLoadingComponent } from './esri-map/control-panels/contol-panel-lazy-loading/contol-panel-lazy-loading.component';
import { LayerControlButtonComponent } from './layer-control-button/layer-control-button.component';
import { StatusInfoComponent } from './esri-map/components/status-info/status-info.component';
import { HistorySectionComponent } from './esri-map/components/history-section/history-section.component';
import { ControlPanelClusteringComponent } from './esri-map/control-panels/control-panel-clustering/control-panel-clustering.component';


@NgModule({
  declarations: [
    EsriMapComponent,
    ControlPanelLayersComponent,
    MapsLayoutComponent,
    ContolPanelLazyLoadingComponent,
    LayerControlButtonComponent,
    StatusInfoComponent,
    HistorySectionComponent,
    ControlPanelClusteringComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MapsRoutingModule,
    TooltipModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    InputSwitchModule
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
