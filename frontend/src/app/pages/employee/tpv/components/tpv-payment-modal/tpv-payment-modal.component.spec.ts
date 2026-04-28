import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvPaymentModalComponent } from './tpv-payment-modal.component';

describe('TpvPaymentModalComponent', () => {
  let component: TpvPaymentModalComponent;
  let fixture: ComponentFixture<TpvPaymentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvPaymentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
