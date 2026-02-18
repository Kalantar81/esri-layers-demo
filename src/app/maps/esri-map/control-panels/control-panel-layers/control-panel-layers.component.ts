import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { HistoryEntry } from '../../components/history-section/history-section.component';
import { HistoryStorageService } from '../../services/history-storage.service';

@Component({
  selector: 'app-control-panel-layers',
  templateUrl: './control-panel-layers.component.html',
  styleUrls: ['./control-panel-layers.component.scss']
})
export class ControlPanelLayersComponent implements OnInit, OnDestroy {
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
  @Output() cleanup = new EventEmitter<void>();

  isHistoryExpanded: boolean = false;
  private readonly PANEL_NAME = 'layers';

  constructor(private historyStorage: HistoryStorageService) {}

  ngOnInit(): void {
    const savedHistory = this.historyStorage.loadHistory(this.PANEL_NAME);
    if (savedHistory.length > 0) {
      this.history = savedHistory;
    }
  }

  onBasemapChange(event: any): void {
    const value = event.target.value;
    this.basemapChange.emit(value);
    this.settingsChange.emit();
  }

  onLayerTypeChange(event: any): void {
    const value = event.target.value;
    this.layerTypeChange.emit(value);
    this.settingsChange.emit();
  }

  onSymbolTypeChange(event: any): void {
    const value = event.target.value;
    this.symbolTypeChange.emit(value);
    this.settingsChange.emit();
  }

  onEntitiesAmountChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    this.entitiesAmountChange.emit(value);
    this.settingsChange.emit();
  }

  onApplySettings(): void {
    console.log('[Layers] Settings values:', {
      basemap: this.selectedBasemap,
      layerType: this.selectedLayerTypeForAll,
      symbolType: this.selectedSymbolType,
      entitiesAmount: this.entitiesAmount
    });
    this.applySettings.emit();
  }

  onHistoryToggle(): void {
    this.isHistoryExpanded = !this.isHistoryExpanded;
    this.historyToggle.emit();
  }

  onClearHistory(): void {
    this.historyClear.emit();
    this.history = [];
    this.historyStorage.clearHistory(this.PANEL_NAME);
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
    this.historyStorage.saveHistory(this.PANEL_NAME, this.history);
    this.cleanup.emit();
  }
}
