import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-bulk-amount-input',
  templateUrl: './bulk-amount-input.component.html',
  styleUrls: ['./bulk-amount-input.component.scss']
})
export class BulkAmountInputComponent {
  @Input() control!: FormControl;
}
