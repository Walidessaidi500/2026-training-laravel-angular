import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvHeaderComponent } from './tpv-header.component';

describe('TpvHeaderComponent', () => {
  let component: TpvHeaderComponent;
  let fixture: ComponentFixture<TpvHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
