import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HistoryEntry } from '../../components/history-section/history-section.component';

export interface LazyLoadingSettings {
  layerType: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side';
  symbolType: string;
  entitiesPerLayer: number;
  bulkAmount: number;
  loadingStrategy: string;
}

@Component({
  selector: 'app-contol-panel-lazy-loading',
  templateUrl: './contol-panel-lazy-loading.component.html',
  styleUrls: ['./contol-panel-lazy-loading.component.scss']
})
export class ContolPanelLazyLoadingComponent implements OnInit, OnDestroy {
  @Output() applySettings = new EventEmitter<LazyLoadingSettings>();
  @Output() historyToggle = new EventEmitter<void>();
  @Output() historyClear = new EventEmitter<void>();
  @Output() cleanup = new EventEmitter<void>();
  
  @Input() history: HistoryEntry[] = [];
  @Input() activeLayerCount: number = 0;
  @Input() entitiesAmount: number = 50000;
  @Input() totalLoadingTime: number = 0;
  @Input() lastLoadedTime: string = '';

  settingsForm!: FormGroup;
  isHistoryExpanded: boolean = false;
  private startTime: number = 0;

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      layerType: new FormControl('geojson'),
      symbolType: new FormControl('simple-marker'),
      entitiesPerLayer: new FormControl(50000),
      bulkAmount: new FormControl(5000),
      loadingStrategy: new FormControl('query-task-pagination')
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.startTime = performance.now();
      this.applySettings.emit(this.settingsForm.value);
    }
  }

  addHistoryEntry(loadingTime: number): void {
    const historyEntry: HistoryEntry = {
      timestamp: new Date(),
      basemap: this.getLayerTypeName(),
      symbolType: this.getSymbolTypeName(),
      totalEntities: this.entitiesAmount * this.activeLayerCount,
      loadingTime: Math.round(loadingTime),
      activeLayersCount: this.activeLayerCount
    };
    
    this.history.unshift(historyEntry);
  }

  onHistoryToggle(): void {
    this.isHistoryExpanded = !this.isHistoryExpanded;
    this.historyToggle.emit();
  }

  onClearHistory(): void {
    this.historyClear.emit();
    this.history = [];
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
    return layerNames[this.settingsForm.get('layerType')?.value] || this.settingsForm.get('layerType')?.value;
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
    return symbolNames[this.settingsForm.get('symbolType')?.value] || this.settingsForm.get('symbolType')?.value;
  }

  ngOnDestroy(): void {
    this.cleanup.emit();
  }
}
