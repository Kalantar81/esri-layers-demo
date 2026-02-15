import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-entities-input',
  templateUrl: './entities-input.component.html',
  styleUrls: ['./entities-input.component.scss']
})
export class EntitiesInputComponent {
  @Input() control!: FormControl;
}
