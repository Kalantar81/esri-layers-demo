import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-entities-input-with-total',
  templateUrl: './entities-input-with-total.component.html',
  styleUrls: ['./entities-input-with-total.component.scss']
})
export class EntitiesInputWithTotalComponent {
  @Input() entitiesAmount: number = 50000;
  @Input() totalLayers: number = 22;
  @Input() disabled: boolean = false;
  @Output() entitiesChange = new EventEmitter<number>();

  onChange(event: any): void {
    this.entitiesChange.emit(parseInt(event.target.value, 10));
  }

  getTotalEntities(): number {
    return this.entitiesAmount * this.totalLayers;
  }
}
