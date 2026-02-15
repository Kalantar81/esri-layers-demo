import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

export interface LazyLoadingSettings {
  layerType: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side';
  symbolType: string;
  entitiesPerLayer: number;
  bulkAmount: number;
  loadingStrategy: string;
}

interface HistoryEntry {
  timestamp: Date;
  basemap: string;
  symbolType: string;
  totalEntities: number;
  loadingTime: number;
  activeLayersCount: number;
}

@Component({
  selector: 'app-contol-panel-lazy-loading',
  templateUrl: './contol-panel-lazy-loading.component.html',
  styleUrls: ['./contol-panel-lazy-loading.component.scss']
})
export class ContolPanelLazyLoadingComponent implements OnInit {
  @Output() applySettings = new EventEmitter<LazyLoadingSettings>();
  @Output() historyToggle = new EventEmitter<void>();
  @Output() historyClear = new EventEmitter<void>();
  
  @Input() history: HistoryEntry[] = [];

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
      // Record the start time for measuring actual loading time
      this.startTime = performance.now();
      
      // Emit the settings
      this.applySettings.emit(this.settingsForm.value);
    }
  }

  // Called by parent component to add history entry with actual loading time
  addHistoryEntry(loadingTime: number): void {
    const formValue = this.settingsForm.value;
    
    const historyEntry: HistoryEntry = {
      timestamp: new Date(),
      basemap: formValue.layerType,
      symbolType: formValue.symbolType,
      totalEntities: formValue.entitiesPerLayer,
      loadingTime: Math.round(loadingTime),
      activeLayersCount: 1
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
}
