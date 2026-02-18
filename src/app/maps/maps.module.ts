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
import { LayerTypeSelectorComponent } from './esri-map/control-panels/controls/layer-type-selector/layer-type-selector.component';
import { SymbolTypeSelectorComponent } from './esri-map/control-panels/controls/symbol-type-selector/symbol-type-selector.component';
import { EntitiesInputComponent } from './esri-map/control-panels/controls/entities-input/entities-input.component';
import { BulkAmountInputComponent } from './esri-map/control-panels/controls/bulk-amount-input/bulk-amount-input.component';
import { ClusteringControlsComponent } from './esri-map/control-panels/controls/clustering-controls/clustering-controls.component';
import { BasemapSelectorComponent } from './esri-map/control-panels/controls/basemap-selector/basemap-selector.component';
import { ClusteringTypeSelectorComponent } from './esri-map/control-panels/controls/clustering-type-selector/clustering-type-selector.component';
import { AnalysisMethodSelectorComponent } from './esri-map/control-panels/controls/analysis-method-selector/analysis-method-selector.component';
import { EntitiesInputWithTotalComponent } from './esri-map/control-panels/controls/entities-input-with-total/entities-input-with-total.component';
import { LoadingStrategySelectorComponent } from './esri-map/control-panels/controls/loading-strategy-selector/loading-strategy-selector.component';
import { ControlPanelLabelsComponent } from './esri-map/control-panels/control-panel-labels/control-panel-labels.component';


@NgModule({
  declarations: [
    EsriMapComponent,
    ControlPanelLayersComponent,
    MapsLayoutComponent,
    ContolPanelLazyLoadingComponent,
    LayerControlButtonComponent,
    StatusInfoComponent,
    HistorySectionComponent,
    ControlPanelClusteringComponent,
    LayerTypeSelectorComponent,
    SymbolTypeSelectorComponent,
    EntitiesInputComponent,
    BulkAmountInputComponent,
    ClusteringControlsComponent,
    BasemapSelectorComponent,
    ClusteringTypeSelectorComponent,
    AnalysisMethodSelectorComponent,
    EntitiesInputWithTotalComponent,
    LoadingStrategySelectorComponent,
    ControlPanelLabelsComponent
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
