import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-layer-type-selector',
  templateUrl: './layer-type-selector.component.html',
  styleUrls: ['./layer-type-selector.component.scss']
})
export class LayerTypeSelectorComponent {
  @Input() control!: FormControl;
}
