import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvUserSelectionModalComponent } from './tpv-user-selection-modal.component';

describe('TpvUserSelectionModalComponent', () => {
  let component: TpvUserSelectionModalComponent;
  let fixture: ComponentFixture<TpvUserSelectionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvUserSelectionModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvUserSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
