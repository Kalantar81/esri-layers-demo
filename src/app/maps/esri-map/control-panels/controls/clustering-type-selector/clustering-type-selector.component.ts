import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-clustering-type-selector',
  templateUrl: './clustering-type-selector.component.html',
  styleUrls: ['./clustering-type-selector.component.scss']
})
export class ClusteringTypeSelectorComponent {
  @Input() selectedType: string = 'dynamic';
  @Input() disabled: boolean = false;
  @Output() typeChange = new EventEmitter<string>();

  onChange(event: any): void {
    this.typeChange.emit(event.target.value);
  }
}
