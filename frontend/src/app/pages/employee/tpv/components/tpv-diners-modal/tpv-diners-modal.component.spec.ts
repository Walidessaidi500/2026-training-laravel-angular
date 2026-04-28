import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvDinersModalComponent } from './tpv-diners-modal.component';

describe('TpvDinersModalComponent', () => {
  let component: TpvDinersModalComponent;
  let fixture: ComponentFixture<TpvDinersModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvDinersModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvDinersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
