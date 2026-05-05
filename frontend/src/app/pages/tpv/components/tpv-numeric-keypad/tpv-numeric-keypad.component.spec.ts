import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvNumericKeypadComponent } from './tpv-numeric-keypad.component';

describe('TpvNumericKeypadComponent', () => {
  let component: TpvNumericKeypadComponent;
  let fixture: ComponentFixture<TpvNumericKeypadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvNumericKeypadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvNumericKeypadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
