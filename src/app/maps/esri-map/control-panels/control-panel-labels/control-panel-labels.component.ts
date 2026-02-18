import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HistoryEntry } from '../../components/history-section/history-section.component';
import { HistoryStorageService } from '../../services/history-storage.service';

export interface LabelSettings {
  layerType: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side';
  symbolType: string;
  entitiesPerLayer: number;
  bulkAmount: number;
  enableClustering: boolean;
  clusteringType: string;
  analysisMethod: string;
  loadingStrategy: string;
  enableLabel: boolean;
  labelZoomVisibility: number;
  enableTooltip: boolean;
}

@Component({
  selector: 'app-control-panel-labels',
  templateUrl: './control-panel-labels.component.html',
  styleUrls: ['./control-panel-labels.component.scss']
})
export class ControlPanelLabelsComponent implements OnInit, OnDestroy {
  @Output() applySettings = new EventEmitter<LabelSettings>();
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
  private readonly PANEL_NAME = 'labels';

  zoomLevels = [
    { zoom: 0, scaleLabel: '591M' },
    { zoom: 1, scaleLabel: '295M' },
    { zoom: 2, scaleLabel: '147M' },
    { zoom: 3, scaleLabel: '73M' },
    { zoom: 4, scaleLabel: '36M' },
    { zoom: 5, scaleLabel: '18M' },
    { zoom: 6, scaleLabel: '9.2M' },
    { zoom: 7, scaleLabel: '4.6M' },
    { zoom: 8, scaleLabel: '2.3M' },
    { zoom: 9, scaleLabel: '1.1M' },
    { zoom: 10, scaleLabel: '577K' },
    { zoom: 11, scaleLabel: '288K' },
    { zoom: 12, scaleLabel: '144K' },
    { zoom: 13, scaleLabel: '72K' },
    { zoom: 14, scaleLabel: '36K' },
    { zoom: 15, scaleLabel: '18K' },
    { zoom: 16, scaleLabel: '9K' },
    { zoom: 17, scaleLabel: '4.5K' },
    { zoom: 18, scaleLabel: '2.2K' },
    { zoom: 19, scaleLabel: '1.1K' },
    { zoom: 20, scaleLabel: '564' }
  ];

  constructor(private historyStorage: HistoryStorageService) {}

  ngOnInit(): void {
    const savedHistory = this.historyStorage.loadHistory(this.PANEL_NAME);
    if (savedHistory.length > 0) {
      this.history = savedHistory;
    }
    this.settingsForm = new FormGroup({
      layerType: new FormControl('geojson'),
      symbolType: new FormControl('simple-marker'),
      entitiesPerLayer: new FormControl(50000),
      bulkAmount: new FormControl(5000),
      enableClustering: new FormControl(false),
      clusteringType: new FormControl('dynamic'),
      analysisMethod: new FormControl('multivariate'),
      loadingStrategy: new FormControl('query-task-pagination'),
      enableLabel: new FormControl(false),
      labelZoomVisibility: new FormControl(7),
      enableTooltip: new FormControl(false)
    });

    this.settingsForm.get('enableClustering')?.valueChanges.subscribe(enabled => {
      if (enabled) {
        this.settingsForm.get('loadingStrategy')?.setValue('clustering');
      }
    });

    this.settingsForm.get('clusteringType')?.valueChanges.subscribe(type => {
      if (this.settingsForm.get('enableClustering')?.value) {
        this.settingsForm.get('loadingStrategy')?.setValue('clustering');
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      const values = { ...this.settingsForm.value };
      if (!values.enableClustering) {
        delete values.clusteringType;
      }
      console.log('[Labels] Form values:', values);
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
    this.historyStorage.clearHistory(this.PANEL_NAME);
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
    this.historyStorage.saveHistory(this.PANEL_NAME, this.history);
    this.cleanup.emit();
  }
}
