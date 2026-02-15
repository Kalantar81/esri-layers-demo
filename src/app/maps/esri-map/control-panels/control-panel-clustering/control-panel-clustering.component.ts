import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HistoryEntry } from '../../components/history-section/history-section.component';

@Component({
  selector: 'app-control-panel-clustering',
  templateUrl: './control-panel-clustering.component.html',
  styleUrls: ['./control-panel-clustering.component.scss']
})
export class ControlPanelClusteringComponent implements OnDestroy {
  @Input() selectedBasemap: string = 'streets-vector';
  @Input() selectedLayerTypeForAll: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side' = 'geojson';
  @Input() selectedSymbolType: string = 'simple-marker';
  @Input() entitiesAmount: number = 50000;
  @Input() isLoading: boolean = false;
  @Input() basemapOptions: Array<{id: string, name: string}> = [];
  @Input() totalLoadingTime: number = 0;
  @Input() lastLoadedTime: string = '';
  @Input() activeLayerCount: number = 0;
  @Input() history: HistoryEntry[] = [];

  @Output() basemapChange = new EventEmitter<string>();
  @Output() layerTypeChange = new EventEmitter<string>();
  @Output() symbolTypeChange = new EventEmitter<string>();
  @Output() entitiesAmountChange = new EventEmitter<number>();
  @Output() applySettings = new EventEmitter<void>();
  @Output() settingsChange = new EventEmitter<void>();
  @Output() historyToggle = new EventEmitter<void>();
  @Output() historyClear = new EventEmitter<void>();
  @Output() clusteringTypeChange = new EventEmitter<string>();
  @Output() analysisMethodChange = new EventEmitter<string>();
  @Output() cleanup = new EventEmitter<void>();

  selectedClusteringType: string = 'dynamic';
  selectedAnalysisMethod: string = 'multivariate';
  isHistoryExpanded: boolean = false;

  onBasemapChange(event: any): void {
    this.basemapChange.emit(event.target.value);
    this.settingsChange.emit();
  }

  onLayerTypeChange(event: any): void {
    this.layerTypeChange.emit(event.target.value);
    this.settingsChange.emit();
  }

  onSymbolTypeChange(event: any): void {
    this.symbolTypeChange.emit(event.target.value);
    this.settingsChange.emit();
  }

  onClusteringTypeChange(event: any): void {
    this.selectedClusteringType = event.target.value;
    this.clusteringTypeChange.emit(event.target.value);
    this.settingsChange.emit();
  }

  onAnalysisMethodChange(event: any): void {
    this.selectedAnalysisMethod = event.target.value;
    this.analysisMethodChange.emit(event.target.value);
    this.settingsChange.emit();
  }

  onEntitiesAmountChange(event: any): void {
    this.entitiesAmountChange.emit(parseInt(event.target.value, 10));
    this.settingsChange.emit();
  }

  onApplySettings(): void {
    this.applySettings.emit();
  }

  onHistoryToggle(): void {
    this.isHistoryExpanded = !this.isHistoryExpanded;
    this.historyToggle.emit();
  }

  onClearHistory(): void {
    this.historyClear.emit();
    this.history = [];
  }

  getTotalEntities(): number {
    return this.entitiesAmount * 22;
  }

  getActiveEntitiesCount(): number {
    return this.entitiesAmount * this.activeLayerCount;
  }

  getLayerTypeName(): string {
    const layerNames: { [key: string]: string } = {
      'geojson': 'GeoJSON Layer',
      'graphics': 'Graphics Layer',
      'feature': 'Feature Layer',
      'csv': 'CSV Layer',
      'feature-collection': 'Feature Layer (Collection)',
      'client-side': 'Feature Layer (Client-Side)'
    };
    return layerNames[this.selectedLayerTypeForAll] || this.selectedLayerTypeForAll;
  }

  getSymbolTypeName(): string {
    const symbolNames: { [key: string]: string } = {
      'simple-marker': 'Simple Point',
      'circle': 'Circle',
      'square': 'Square',
      'diamond': 'Diamond',
      'cross': 'Cross',
      'x': 'X Symbol',
      'triangle': 'Triangle',
      'picture-marker': 'SVG Icon',
      'complex-svg': 'Complex SVG',
      'png-image': 'Custom Icon'
    };
    return symbolNames[this.selectedSymbolType] || this.selectedSymbolType;
  }

  ngOnDestroy(): void {
    this.cleanup.emit();
  }
}
