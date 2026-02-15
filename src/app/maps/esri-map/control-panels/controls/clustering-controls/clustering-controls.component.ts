import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-clustering-controls',
  templateUrl: './clustering-controls.component.html',
  styleUrls: ['./clustering-controls.component.scss']
})
export class ClusteringControlsComponent {
  @Input() formGroup!: FormGroup;
}
