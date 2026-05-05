import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvCartComponent } from './tpv-cart.component';

describe('TpvCartComponent', () => {
  let component: TpvCartComponent;
  let fixture: ComponentFixture<TpvCartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvCartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
