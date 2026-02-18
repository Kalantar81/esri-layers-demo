import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPanelLabelsComponent } from './control-panel-labels.component';

describe('ControlPanelLabelsComponent', () => {
  let component: ControlPanelLabelsComponent;
  let fixture: ComponentFixture<ControlPanelLabelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlPanelLabelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlPanelLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
