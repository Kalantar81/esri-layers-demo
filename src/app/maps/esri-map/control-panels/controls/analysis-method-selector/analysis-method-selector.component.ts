import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-analysis-method-selector',
  templateUrl: './analysis-method-selector.component.html',
  styleUrls: ['./analysis-method-selector.component.scss']
})
export class AnalysisMethodSelectorComponent {
  @Input() selectedMethod: string = 'multivariate';
  @Input() disabled: boolean = false;
  @Output() methodChange = new EventEmitter<string>();

  onChange(event: any): void {
    this.methodChange.emit(event.target.value);
  }
}
