import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface HistoryEntry {
  timestamp: Date;
  basemap: string;
  symbolType: string;
  totalEntities: number;
  loadingTime: number;
  activeLayersCount: number;
}

@Component({
  selector: 'app-history-section',
  templateUrl: './history-section.component.html',
  styleUrls: ['./history-section.component.scss']
})
export class HistorySectionComponent {
  @Input() history: HistoryEntry[] = [];
  @Input() isExpanded: boolean = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onToggle(): void {
    this.isExpanded = !this.isExpanded;
    this.toggle.emit();
  }

  onClear(): void {
    this.clear.emit();
  }
}
