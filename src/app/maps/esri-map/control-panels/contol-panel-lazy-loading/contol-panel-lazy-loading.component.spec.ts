import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContolPanelLazyLoadingComponent } from './contol-panel-lazy-loading.component';

describe('ContolPanelLazyLoadingComponent', () => {
  let component: ContolPanelLazyLoadingComponent;
  let fixture: ComponentFixture<ContolPanelLazyLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContolPanelLazyLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContolPanelLazyLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
