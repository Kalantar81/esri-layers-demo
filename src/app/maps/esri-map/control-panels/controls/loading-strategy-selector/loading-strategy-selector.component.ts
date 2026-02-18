import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-loading-strategy-selector',
  templateUrl: './loading-strategy-selector.component.html',
  styleUrls: ['./loading-strategy-selector.component.scss']
})
export class LoadingStrategySelectorComponent {
  @Input() control!: FormControl;
}
