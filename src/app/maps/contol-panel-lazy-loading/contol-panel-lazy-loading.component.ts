import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

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
export class ContolPanelLazyLoadingComponent implements OnInit {
  @Output() applySettings = new EventEmitter<LazyLoadingSettings>();

  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      layerType: new FormControl('geojson'),
      symbolType: new FormControl('simple-marker'),
      entitiesPerLayer: new FormControl(50000),
      bulkAmount: new FormControl(5),
      loadingStrategy: new FormControl('query-task-pagination')
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.applySettings.emit(this.settingsForm.value);
    }
  }
}
