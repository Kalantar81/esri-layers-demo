import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-symbol-type-selector',
  templateUrl: './symbol-type-selector.component.html',
  styleUrls: ['./symbol-type-selector.component.scss']
})
export class SymbolTypeSelectorComponent {
  @Input() control!: FormControl;
}
