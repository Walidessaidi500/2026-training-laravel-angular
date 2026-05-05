import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvTableSelectionComponent } from './tpv-table-selection.component';

describe('TpvTableSelectionComponent', () => {
  let component: TpvTableSelectionComponent;
  let fixture: ComponentFixture<TpvTableSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvTableSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvTableSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
