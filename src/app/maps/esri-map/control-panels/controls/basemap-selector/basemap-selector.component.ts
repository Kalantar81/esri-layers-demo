import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-basemap-selector',
  templateUrl: './basemap-selector.component.html',
  styleUrls: ['./basemap-selector.component.scss']
})
export class BasemapSelectorComponent {
  @Input() selectedBasemap: string = 'streets-vector';
  @Input() basemapOptions: Array<{id: string, name: string}> = [];
  @Input() disabled: boolean = false;
  @Output() basemapChange = new EventEmitter<string>();

  onChange(event: any): void {
    this.basemapChange.emit(event.target.value);
  }
}
