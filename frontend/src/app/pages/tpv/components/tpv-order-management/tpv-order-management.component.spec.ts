import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TpvOrderManagementComponent } from './tpv-order-management.component';

describe('TpvOrderManagementComponent', () => {
  let component: TpvOrderManagementComponent;
  let fixture: ComponentFixture<TpvOrderManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TpvOrderManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TpvOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
