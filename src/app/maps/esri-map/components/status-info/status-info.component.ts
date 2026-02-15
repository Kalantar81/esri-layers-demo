import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-info',
  templateUrl: './status-info.component.html',
  styleUrls: ['./status-info.component.scss']
})
export class StatusInfoComponent {
  @Input() activeLayerCount: number = 0;
  @Input() totalEntities: number = 0;
  @Input() layerTypeName: string = '';
  @Input() symbolTypeName: string = '';
  @Input() totalLoadingTime: number = 0;
  @Input() lastLoadedTime: string = '';
}
