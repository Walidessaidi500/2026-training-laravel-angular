import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvPinModalComponent } from './tpv-pin-modal.component';

describe('TpvPinModalComponent', () => {
  let component: TpvPinModalComponent;
  let fixture: ComponentFixture<TpvPinModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvPinModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvPinModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
