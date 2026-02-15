import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-layer-control-button',
  templateUrl: './layer-control-button.component.html',
  styleUrls: ['./layer-control-button.component.scss']
})
export class LayerControlButtonComponent {
  @Output() toggle = new EventEmitter<void>();

  onToggle(): void {
    this.toggle.emit();
  }
}
